using Rentravel.Domain.ValueObjects;

namespace Rentravel.Shared;

public static class LocalizedExtensions
{
    public static bool IsBlank(this LocalizedText? text) =>
        text is null
        || (string.IsNullOrWhiteSpace(text.Tr) && string.IsNullOrWhiteSpace(text.En) && string.IsNullOrWhiteSpace(text.Ar));

    public static LocalizedText? OrNull(this LocalizedText? text) => text.IsBlank() ? null : text;

    public static bool IsBlank(this LocalizedHtml? html) =>
        html is null
        || (string.IsNullOrWhiteSpace(html.Tr) && string.IsNullOrWhiteSpace(html.En) && string.IsNullOrWhiteSpace(html.Ar));

    public static LocalizedHtml? OrNull(this LocalizedHtml? html) => html.IsBlank() ? null : html;
}