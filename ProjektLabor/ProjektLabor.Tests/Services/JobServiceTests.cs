using Moq;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data;
using ProjektLabor.Data.Entity;
using ProjektLabor.Services;
using System.Security.Claims;
using ProjektLabor.Data.Dto;
using ProjektLabor.Data;
using Xunit.Abstractions;

namespace ProjektLabor.Tests.Services;

public class JobServiceTests
{
    private readonly Mock<AppDbContext> _mockContext;
    private readonly JobService _jobService;

    public JobServiceTests()
    {

        var options = new DbContextOptionsBuilder<AppDbContext>().Options;
        _mockContext = new Mock<AppDbContext>(options);

        _jobService = new JobService(_mockContext.Object);
    }
    
    private Mock<DbSet<T>> CreateMockDbSet<T>(List<T> sourceList) where T : class
    {
        var queryable = sourceList.AsQueryable();
        var dbSet = new Mock<DbSet<T>>();

        dbSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        dbSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        dbSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        dbSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

        // Mock the AddAsync method to add items to our list
        dbSet.Setup(d => d.AddAsync(It.IsAny<T>(), It.IsAny<CancellationToken>()))
            .Callback<T, CancellationToken>((s, c) => sourceList.Add(s));

        return dbSet;
    }
    
    [Fact]
    public async Task DeleteJobAsync_WhenJobExists_ShouldSetIsArchivedAndSaveChanges()
    {
        // Arrange
        var job = new Job { Id = 1, Title = "Old Job", IsArchived = false };
        var jobs = new List<Job> { job };

        // We need to mock FindAsync separately because it works differently than querying
        var mockDbSet = CreateMockDbSet(jobs);
        mockDbSet.Setup(s => s.FindAsync(It.IsAny<object[]>())).ReturnsAsync(job);
        _mockContext.Setup(c => c.Jobs).Returns(mockDbSet.Object);

        // Act
        var result = await _jobService.DeleteJobAsync(1, "company-user-1", true);

        // Assert
        result.Should().BeTrue();
        job.IsArchived.Should().BeTrue();
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}