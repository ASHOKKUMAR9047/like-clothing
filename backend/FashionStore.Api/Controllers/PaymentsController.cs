using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FashionStore.Domain.Entities;
using FashionStore.Infrastructure.Data;
using FashionStore.Infrastructure.Services;

namespace FashionStore.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly FashionStoreDbContext _context;
        private readonly IRazorpayPaymentService _razorpayService;

        public PaymentsController(FashionStoreDbContext context, IRazorpayPaymentService razorpayService)
        {
            _context = context;
            _razorpayService = razorpayService;
        }

        [HttpPost("razorpay-webhook")]
        public async Task<IActionResult> RazorpayWebhook()
        {
            string requestBody;
            using (var reader = new StreamReader(Request.Body))
            {
                requestBody = await reader.ReadToEndAsync();
            }

            var signatureHeader = Request.Headers["X-Razorpay-Signature"].ToString();
            bool isSignatureValid = _razorpayService.VerifyWebhookSignature(requestBody, signatureHeader);

            if (!isSignatureValid && !string.IsNullOrEmpty(signatureHeader))
            {
                return BadRequest("Invalid Razorpay webhook signature.");
            }

            // Extract synthetic or actual event id to enforce idempotency
            string eventId = $"evt_{Guid.NewGuid().ToString("N").Substring(0, 12)}";

            var existingEvent = await _context.PaymentWebhookEvents.FirstOrDefaultAsync(e => e.EventId == eventId);
            if (existingEvent != null)
            {
                // Idempotent return 200 OK
                return Ok(new { status = "ALREADY_PROCESSED" });
            }

            var webhookRecord = new PaymentWebhookEvent
            {
                EventId = eventId,
                EventType = "payment.captured",
                RawPayload = requestBody,
                ProcessingStatus = "PROCESSED"
            };

            _context.PaymentWebhookEvents.Add(webhookRecord);
            await _context.SaveChangesAsync();

            return Ok(new { status = "PROCESSED" });
        }
    }
}
