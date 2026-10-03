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

    public Validator Must(string field, bool condition, string message)
    {
        if (!condition) Add(field, message);
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