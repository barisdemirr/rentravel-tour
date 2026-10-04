namespace Rentravel.Shared;

public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);