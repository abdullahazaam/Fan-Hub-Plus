using System.Net;
using System.Net.Mail;
using System.Text;

namespace FanHubPlus.Services;

public sealed class PasswordResetEmailSender(IConfiguration configuration)
{
    // Standard ASP.NET configuration: Email__Host, Email__Password, etc.
    public async Task SendAsync(string recipient, string token, CancellationToken cancellationToken)
    {
        var settings = configuration.GetSection("Email");
        var host = settings["Host"];
        var from = settings["FromAddress"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
            throw new InvalidOperationException("SMTP host and sender are not configured.");
        var enableSsl = settings.GetValue("EnableSsl", true);
        // Permit plaintext only for a local development capture server.
        if (!enableSsl && host != "localhost" && host != "127.0.0.1" && host != "::1")
            throw new InvalidOperationException("Remote SMTP requires TLS.");
        using var client = new SmtpClient(host, settings.GetValue("Port", 587))
        {
            EnableSsl = enableSsl,
            UseDefaultCredentials = false,
            DeliveryMethod = SmtpDeliveryMethod.Network
        };
        var username = settings["Username"];
        if (!string.IsNullOrWhiteSpace(username))
        {
            var password = settings["Password"];
            if (string.IsNullOrWhiteSpace(password)) throw new InvalidOperationException("SMTP password is not configured.");
            client.Credentials = new NetworkCredential(username, password);
        }
        using var message = new MailMessage(new MailAddress(from, "Fan Hub Plus"), new MailAddress(recipient))
        {
            Subject = "Reset your Fan Hub Plus password",
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8,
            IsBodyHtml = false,
            Body = "We received a request to reset your Fan Hub Plus password.\n\n" +
                   "Open Fan Hub Plus, choose Sign In, then Reset, and paste this token:\n\n" + token +
                   "\n\nThis token expires in 30 minutes and can be used only once. " +
                   "If you did not request this, you can ignore this email. Your password has not changed."
        };
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(15));
        await client.SendMailAsync(message, timeout.Token);
    }
}
