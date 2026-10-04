namespace Rentravel.Domain.ValueObjects;

public sealed record InclusionsBlock
{
    public List<ListItem> Included { get; init; } = [];
    public List<ListItem> Excluded { get; init; } = [];
}