using System.Net;
using System.Net.Mail;
using System.Text;

namespace FanHubPlus.Services;

public sealed class PasswordResetEmailSender(IConfiguration configuration)
{
    // Standard ASP.NET configuration: Email__Host, Email__Password, etc.
    public Task SendAsync(string recipient, string token, CancellationToken cancellationToken) =>
        SendMessageAsync(recipient, "Reset your Fan Hub Plus password",
            "We received a request to reset your Fan Hub Plus password.\n\nOpen Fan Hub Plus, choose Sign In, then Reset, and paste this token:\n\n" + token +
            "\n\nThis token expires in 30 minutes and can be used only once. If you did not request this, ignore this email. Your password has not changed.", cancellationToken);

    public Task SendVerificationAsync(string recipient, string token, CancellationToken cancellationToken)
    {
        var baseUrl = configuration["Email:VerificationBaseUrl"];
        if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri) ||
            (uri.Scheme != "https" && !(uri.Scheme == "http" && uri.IsLoopback)))
            throw new InvalidOperationException("Email verification requires a configured HTTPS frontend URL.");
        var link = new UriBuilder(uri) { Fragment = "verify-email=" + Uri.EscapeDataString(token), Query = "" }.Uri.AbsoluteUri;
        return SendMessageAsync(recipient, "Verify your Fan Hub Plus email",
            "Welcome to Fan Hub Plus. Verify your email to sign in:\n\n" + link +
            "\n\nThis link expires in 30 minutes and can be used only once. If you did not create this account, ignore this email.", cancellationToken);
    }

    private async Task SendMessageAsync(string recipient, string subject, string body, CancellationToken cancellationToken)
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
            Subject = subject,
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8,
            IsBodyHtml = false,
            Body = body
        };
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(15));
        await client.SendMailAsync(message, timeout.Token);
    }
}
