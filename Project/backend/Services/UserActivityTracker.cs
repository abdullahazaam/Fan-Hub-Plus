using FanHubPlus.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FanHubPlus.Services;

// One activity write per user per five minutes, including concurrent requests/instances.
public sealed class UserActivityTracker : IDisposable
{
    private readonly MemoryCache cache = new(new MemoryCacheOptions { SizeLimit = 10000 });
    private readonly SemaphoreSlim[] gates = Enumerable.Range(0, 64).Select(_ => new SemaphoreSlim(1, 1)).ToArray();
    public async Task RecordAsync(int id, FanHubDbContext db, CancellationToken cancellationToken)
    {
        if (id <= 0 || cache.TryGetValue(id, out _)) return;
        var gate = gates[id % gates.Length];
        await gate.WaitAsync(cancellationToken);
        try
        {
            if (cache.TryGetValue(id, out _)) return;
            var now = DateTime.UtcNow;
            var cutoff = now.AddMinutes(-5);
            await db.Users.Where(u => u.Id == id && (u.LastActiveAt == null || u.LastActiveAt <= cutoff))
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.LastActiveAt, now), cancellationToken);
            cache.Set(id, true, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5), Size = 1 });
        }
        finally { gate.Release(); }
    }
    public void Dispose() { cache.Dispose(); foreach (var gate in gates) gate.Dispose(); }
}
