using ITMS.Application.DTOs;
using ITMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITMS.API.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize]
public class AssetController : ControllerBase
{
    private readonly IAssetService _assetService;

    public AssetController(IAssetService assetService)
    {
        _assetService = assetService;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_assetService.GetAll());

    [HttpGet("available")]
    public IActionResult GetAvailable() => Ok(_assetService.GetAvailableAssets());

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var asset = _assetService.GetById(id);
        return asset == null ? NotFound() : Ok(asset);
    }

    [HttpPost]
    [Authorize(Policy = "ManageAssets")]
    public IActionResult Create([FromBody] CreateAssetDto dto)
        => Ok(_assetService.CreateAsset(dto));

    [HttpPost("{id}/assign")]
    [Authorize(Policy = "ManageAssets")]
    public IActionResult Assign(int id, [FromBody] AssignAssetDto dto)
    {
        try
        {
            _assetService.AssignAssetToUser(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Policy = "ManageAssets")]
    public IActionResult UpdateStatus(int id, [FromBody] UpdateAssetStatusDto dto)
    {
        var result = _assetService.UpdateAssetStatus(id, dto);
        return result == null ? NotFound() : Ok(result);
    }
}
