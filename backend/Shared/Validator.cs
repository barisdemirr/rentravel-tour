using Rentravel.Domain.ValueObjects;

namespace Rentravel.Shared;

public class Validator
{
    private readonly Dictionary<string, List<string>> _errors = new();

    public bool IsValid => _errors.Count == 0;

    public Validator Required(string field, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) Add(field, $"{field} zorunludur.");
        return this;
    }

    public Validator MaxLength(string field, string? value, int max)
    {
        if (value is not null && value.Length > max) Add(field, $"{field} en fazla {max} karakter olabilir.");
        return this;
    }

    public Validator MinLength(string field, string? value, int min)
    {
        if (value is not null && value.Length < min) Add(field, $"{field} en az {min} karakter olmalı.");
        return this;
    }

    public Validator Email(string field, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value) &&
            !(System.Net.Mail.MailAddress.TryCreate(value, out var address) && address.Address == value))
            Add(field, $"{field} geçerli bir e-posta adresi olmalı.");
        return this;
    }

    public Validator Must(string field, bool condition, string message)
    {
        if (!condition) Add(field, message);
        return this;
    }

    public Validator AddError(string field, string message)
    {
        Add(field, message);
        return this;
    }


    public Validator LocalizedRequired(string field, LocalizedText? value, int max)
    {
        if (value is null || string.IsNullOrWhiteSpace(value.Tr))
            Add($"{field}.tr", $"{field}.tr zorunludur.");
        return LocalizedMax(field, value, max);
    }

    public Validator LocalizedOptional(string field, LocalizedText? value, int max)
    {
        if (value.IsBlank()) return this; // tamamen boş gelirse "verilmedi" sayılır
        if (string.IsNullOrWhiteSpace(value!.Tr))
            Add($"{field}.tr", $"{field} verildiyse {field}.tr zorunludur.");
        return LocalizedMax(field, value, max);
    }

    private Validator LocalizedMax(string field, LocalizedText? value, int max)
    {
        if (value is null) return this;
        if (value.Tr?.Length > max) Add($"{field}.tr", $"{field}.tr en fazla {max} karakter olabilir.");
        if (value.En?.Length > max) Add($"{field}.en", $"{field}.en en fazla {max} karakter olabilir.");
        if (value.Ar?.Length > max) Add($"{field}.ar", $"{field}.ar en fazla {max} karakter olabilir.");
        return this;
    }


    public Validator Each<T>(string field, List<T>? items, int max, Action<T, string> check) where T : class
    {
        if (items is null) return this;

        if (items.Count > max)
        {
            Add(field, $"En fazla {max} öğe eklenebilir.");
            return this;
        }

        for (var i = 0; i < items.Count; i++)
        {
            if (items[i] is null)
            {
                Add($"{field}[{i}]", "Geçersiz öğe.");
                continue;
            }

            check(items[i], $"{field}[{i}]");
        }

        return this;
    }

    public Result ToFailure() => Result.Fail(BuildError());
    public Result<T> ToFailure<T>() => Result<T>.Fail(BuildError());

    private Error BuildError() =>
        Error.Validation(_errors.ToDictionary(x => x.Key, x => x.Value.ToArray()));

    private void Add(string field, string message)
    {
        if (!_errors.TryGetValue(field, out var list)) _errors[field] = list = [];
        list.Add(message);
    }
}