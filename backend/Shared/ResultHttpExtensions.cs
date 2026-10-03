namespace Rentravel.Shared;

public static class ResultHttpExtensions
{
    public static IResult ToHttp<T>(this Result<T> result, Func<T, IResult> onSuccess) =>
        result.IsSuccess ? onSuccess(result.Value!) : result.Error!.ToProblem();

    public static IResult ToHttp(this Result result, Func<IResult> onSuccess) =>
        result.IsSuccess ? onSuccess() : result.Error!.ToProblem();

    private static IResult ToProblem(this Error error) => error.Type switch
    {
        ErrorType.Validation => Results.ValidationProblem(error.Details ?? new(), title: error.Message),
        ErrorType.NotFound => Results.Problem(error.Message, statusCode: 404, title: "Bulunamadı"),
        ErrorType.Conflict => Results.Problem(error.Message, statusCode: 409, title: "Çakışma"),
        _ => Results.Problem(error.Message)
    };
}