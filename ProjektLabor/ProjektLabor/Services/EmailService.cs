using System.Net;
using System.Net.Mail;

namespace ProjektLabor.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var host = _configuration["Email:Host"] ?? "localhost";
                var port = int.Parse(_configuration["Email:Port"] ?? "25");
                var from = _configuration["Email:From"] ?? "noreply@projektlabor.hu";

                using var client = new SmtpClient(host, port);
                // Smtp4Dev doesn't require auth, but if we needed it:
                // client.Credentials = new NetworkCredential("user", "pass");
                
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(from),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true // Allows simple HTML formatting
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation($"Email sent to {toEmail}: {subject}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {toEmail}");
                // In a real app, we might want to queue this or throw, 
                // but for MVP we log and continue to not break the flow.
            }
        }
    }
}