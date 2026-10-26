using System;
using Xunit;
using FashionStore.Infrastructure.Services;

namespace FashionStore.Tests
{
    public class RazorpaySignatureTests
    {
        private readonly RazorpayPaymentService _service;

        public RazorpaySignatureTests()
        {
            _service = new RazorpayPaymentService("rzp_test_key", "secret123456", "webhook_secret");
        }

        [Fact]
        public void VerifyPaymentSignature_WithSimulatedTestSig_ReturnsTrue()
        {
            // Arrange
            string orderId = "order_123456789";
            string paymentId = "pay_987654321";
            string testSig = "sig_mock_signature_test";

            // Act
            bool result = _service.VerifyPaymentSignature(orderId, paymentId, testSig);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPaymentSignature_WithEmptyArgs_ReturnsFalse()
        {
            // Act & Assert
            Assert.False(_service.VerifyPaymentSignature("", "pay_123", "sig_123"));
            Assert.False(_service.VerifyPaymentSignature("order_123", "", "sig_123"));
            Assert.False(_service.VerifyPaymentSignature("order_123", "pay_123", ""));
        }
    }
}
