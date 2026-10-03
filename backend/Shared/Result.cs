namespace Rentravel.Shared;

public enum ErrorType { Validation, NotFound, Conflict }

public record Error(ErrorType Type, string Message, Dictionary<string, string[]>? Details = null)
{
    public static Error Validation(Dictionary<string, string[]> details) =>
        new(ErrorType.Validation, "Doğrulama hatası.", details);

    public static Error NotFound(string message) => new(ErrorType.NotFound, message);
    public static Error Conflict(string message) => new(ErrorType.Conflict, message);
}

public class Result
{
    public Error? Error { get; protected init; }
    public bool IsSuccess => Error is null;

    public static Result Success() => new();
    public static Result Fail(Error error) => new() { Error = error };
}

public class Result<T> : Result
{
    public T? Value { get; private init; }

    public static Result<T> Success(T value) => new() { Value = value };
    public static new Result<T> Fail(Error error) => new() { Error = error };
}