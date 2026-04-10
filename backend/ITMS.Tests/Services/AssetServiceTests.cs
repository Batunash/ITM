using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using ITMS.Application.Services;
using ITMS.Domain.Entities;
using ITMS.Domain.Interfaces;
using ITMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace ITMS.Tests.Services;

public class AssetServiceTests
{
    private AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public void AssignAssetToUser_WhenInStorage_ShouldChangeStatusToInUse()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Statuses.AddRange(
            new Status { Id = 7, Name = "InStorage" },
            new Status { Id = 8, Name = "InUse" }
        );
        context.AssetTypes.Add(new AssetType { Id = 1, TypeName = "Laptop" });
        context.Assets.Add(new Asset { Id = 1, AssetName = "MacBook Pro", AssetTypeId = 1, StatusId = 7 });
        context.SaveChanges();

        var assetRepo = new Mock<IAssetRepository>();
        var auditService = new Mock<IAuditLogService>();
        var service = new AssetService(assetRepo.Object, auditService.Object, context);

        // Act
        service.AssignAssetToUser(1, new AssignAssetDto { UserId = 5 });

        // Assert
        var asset = context.Assets.Find(1);
        Assert.Equal(8, asset!.StatusId);
        Assert.Equal(5, asset.AssignedToUserId);
    }

    [Fact]
    public void AssignAssetToUser_WhenInUse_ShouldThrowException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.Statuses.Add(new Status { Id = 8, Name = "InUse" });
        context.AssetTypes.Add(new AssetType { Id = 1, TypeName = "Laptop" });
        context.Assets.Add(new Asset { Id = 1, AssetName = "MacBook Pro", AssetTypeId = 1, StatusId = 8 });
        context.SaveChanges();

        var assetRepo = new Mock<IAssetRepository>();
        var auditService = new Mock<IAuditLogService>();
        var service = new AssetService(assetRepo.Object, auditService.Object, context);

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() =>
            service.AssignAssetToUser(1, new AssignAssetDto { UserId = 5 }));
    }
}
