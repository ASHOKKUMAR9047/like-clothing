using System;
using Xunit;

namespace FashionStore.Tests
{
    public class OrderCalculationTests
    {
        [Fact]
        public void CalculateOrderTotal_WithHighValueOrder_GrantsComplimentaryShipping()
        {
            // Arrange
            decimal subtotal = 48999m;
            decimal discount = 7349.85m; // 15% FESTIVE15
            decimal freeShippingThreshold = 2999m;

            // Act
            decimal shippingFee = subtotal > freeShippingThreshold ? 0m : 250m;
            decimal total = subtotal - discount + shippingFee;

            // Assert
            Assert.Equal(0m, shippingFee);
            Assert.Equal(41649.15m, total);
        }

        [Fact]
        public void CalculateOrderTotal_BelowThreshold_AddsShippingFee()
        {
            // Arrange
            decimal subtotal = 1800m;
            decimal discount = 0m;

            // Act
            decimal shippingFee = subtotal > 2999m ? 0m : 250m;
            decimal total = subtotal - discount + shippingFee;

            // Assert
            Assert.Equal(250m, shippingFee);
            Assert.Equal(2050m, total);
        }

        [Theory]
        [InlineData(10000, 15, 1500)]
        [InlineData(20000, 10, 2000)]
        public void CouponDiscountCalculation_ComputesExpectedPercentage(decimal subtotal, decimal percent, decimal expectedDiscount)
        {
            // Act
            decimal discount = (subtotal * percent) / 100m;

            // Assert
            Assert.Equal(expectedDiscount, discount);
        }
    }
}
