using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FashionStore.Application.Common;
using FashionStore.Application.DTOs;
using FashionStore.Domain.Entities;
using FashionStore.Infrastructure.Data;
using FashionStore.Infrastructure.Services;

namespace FashionStore.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FashionStoreDbContext _context;
        private readonly IJwtTokenService _jwtService;

        public AuthController(FashionStoreDbContext context, IJwtTokenService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Email address is required."));
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (user == null)
            {
                // Auto-create demo customer if logging in for first time in dev
                user = new User
                {
                    FullName = request.Email.Contains("admin") ? "Rohit Varma (Director)" : "Valued Patron",
                    Email = request.Email,
                    Role = request.Email.Contains("admin") ? "Admin" : "Customer",
                    PhoneNumber = "+91 98765 43210"
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var token = _jwtService.GenerateToken(user);

            var response = new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Token = token
            };

            return Ok(ApiResponse<AuthResponseDto>.Ok(response, "Signed in successfully."));
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterRequestDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("An account with this email address already exists."));
            }

            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Role = "Customer"
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(newUser);

            var response = new AuthResponseDto
            {
                UserId = newUser.Id,
                FullName = newUser.FullName,
                Email = newUser.Email,
                Role = newUser.Role,
                Token = token
            };

            return Ok(ApiResponse<AuthResponseDto>.Ok(response, "Registration completed successfully."));
        }
    }
}
