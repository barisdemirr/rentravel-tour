using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.StaticPages;

public record StaticPageInput
{
    public string? Slug { get; init; }
    public LocalizedText? Title { get; init; }
    public LocalizedHtml? Content { get; init; }
    public LocalizedText? SeoTitle { get; init; }
    public LocalizedText? SeoDescription { get; init; }
    public int OrderIndex { get; init; }
    public bool IsActive { get; init; }
}

public class StaticPageSaveHandler(AppDbContext db, HtmlCleaner html)
{
    private const int MaxContentLength = 100000;

    public async Task<Result<StaticPageDto>> Save(StaticPage? existing, StaticPageInput input, CancellationToken ct)
    {
        var content = html.Clean(input.Content);

        var validator = new Validator()
            .LocalizedRequired("title", input.Title, 150)
            .LocalizedOptional("seoTitle", input.SeoTitle, 120)
            .LocalizedOptional("seoDescription", input.SeoDescription, 300)
            .Must("content",
                  input.Content is null || (Len(input.Content.Tr) <= MaxContentLength
                      && Len(input.Content.En) <= MaxContentLength && Len(input.Content.Ar) <= MaxContentLength),
                  $"content her dilde en fazla {MaxContentLength} karakter olabilir.")
            .Must("content", content is not null && !string.IsNullOrWhiteSpace(content.Tr),
                  "content.tr zorunludur ve geçerli içerik barındırmalı.");

        var plan = SlugResolver.Plan(input.Slug, existing?.Slug, input.Title?.Tr, validator);

        if (!validator.IsValid) return validator.ToFailure<StaticPageDto>();

        var currentId = existing?.Id ?? Guid.Empty;
        var (slug, conflict) = await SlugResolver.EnsureUniqueAsync(
            plan, existing is null,
            s => db.StaticPages.AnyAsync(x => x.Slug == s && x.Id != currentId, ct));

        if (conflict is not null) return Result<StaticPageDto>.Fail(conflict);

        var page = existing ?? new StaticPage();

        page.Slug = slug;
        page.Title = input.Title!;
        page.Content = content!;
        page.SeoTitle = input.SeoTitle.OrNull();
        page.SeoDescription = input.SeoDescription.OrNull();
        page.OrderIndex = input.OrderIndex;
        page.IsActive = input.IsActive;

        if (existing is null) db.StaticPages.Add(page);
        await db.SaveChangesAsync(ct);

        return Result<StaticPageDto>.Success(StaticPageDto.From(page));
    }

    private static int Len(string? s) => s?.Length ?? 0;
}