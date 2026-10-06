IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003052354_InitialCreate'
)
BEGIN
    CREATE TABLE [VehicleSegments] (
        [Id] uniqueidentifier NOT NULL,
        [Key] nvarchar(50) NOT NULL,
        [Label] nvarchar(max) NOT NULL,
        [Icon] nvarchar(100) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_VehicleSegments] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003052354_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_VehicleSegments_Key] ON [VehicleSegments] ([Key]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003052354_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261003052354_InitialCreate', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    CREATE TABLE [AccommodationTypes] (
        [Id] uniqueidentifier NOT NULL,
        [Key] nvarchar(50) NOT NULL,
        [Label] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Icon] nvarchar(100) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_AccommodationTypes] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    CREATE TABLE [BungalowRegions] (
        [Id] uniqueidentifier NOT NULL,
        [Key] nvarchar(50) NOT NULL,
        [ShortLabel] nvarchar(max) NOT NULL,
        [FullLabel] nvarchar(max) NOT NULL,
        [Thumbnail] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_BungalowRegions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    CREATE TABLE [TourCategories] (
        [Id] uniqueidentifier NOT NULL,
        [Key] nvarchar(50) NOT NULL,
        [Label] nvarchar(max) NOT NULL,
        [Icon] nvarchar(100) NOT NULL,
        [AppliesTo] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_TourCategories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    CREATE TABLE [VehicleExtras] (
        [Id] uniqueidentifier NOT NULL,
        [Key] nvarchar(50) NOT NULL,
        [Icon] nvarchar(100) NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Tooltip] nvarchar(max) NULL,
        [DailyPrice] decimal(18,2) NOT NULL,
        [Currency] nvarchar(3) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_VehicleExtras] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_AccommodationTypes_Key] ON [AccommodationTypes] ([Key]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_BungalowRegions_Key] ON [BungalowRegions] ([Key]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_TourCategories_Key] ON [TourCategories] ([Key]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_VehicleExtras_Key] ON [VehicleExtras] ([Key]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003054652_AddCatalogEntities'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261003054652_AddCatalogEntities', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003110107_MakeVehicleExtraKeyCaseInsensitive'
)
BEGIN
    DROP INDEX [IX_VehicleExtras_Key] ON [VehicleExtras];
    DECLARE @var sysname;
    SELECT @var = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[VehicleExtras]') AND [c].[name] = N'Key');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [VehicleExtras] DROP CONSTRAINT [' + @var + '];');
    ALTER TABLE [VehicleExtras] ALTER COLUMN [Key] nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL;
    EXEC(N'CREATE UNIQUE INDEX [IX_VehicleExtras_Key] ON [VehicleExtras] ([Key]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003110107_MakeVehicleExtraKeyCaseInsensitive'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261003110107_MakeVehicleExtraKeyCaseInsensitive', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003112921_AddAdminUsers'
)
BEGIN
    CREATE TABLE [AdminUsers] (
        [Id] uniqueidentifier NOT NULL,
        [Email] nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        [PasswordHash] nvarchar(256) NOT NULL,
        [FullName] nvarchar(100) NOT NULL,
        [LastLoginAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_AdminUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003112921_AddAdminUsers'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_AdminUsers_Email] ON [AdminUsers] ([Email]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261003112921_AddAdminUsers'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261003112921_AddAdminUsers', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004073342_AddMediaAssets'
)
BEGIN
    CREATE TABLE [MediaAssets] (
        [Id] uniqueidentifier NOT NULL,
        [Category] nvarchar(20) NOT NULL,
        [FileName] nvarchar(255) NOT NULL,
        [FilePath] nvarchar(500) NOT NULL,
        [MimeType] nvarchar(50) NOT NULL,
        [FileSize] bigint NOT NULL,
        [Width] int NOT NULL,
        [Height] int NOT NULL,
        [AltText] nvarchar(max) NULL,
        [UploadedBy] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_MediaAssets] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_MediaAssets_AdminUsers_UploadedBy] FOREIGN KEY ([UploadedBy]) REFERENCES [AdminUsers] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004073342_AddMediaAssets'
)
BEGIN
    CREATE INDEX [IX_MediaAssets_Category] ON [MediaAssets] ([Category]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004073342_AddMediaAssets'
)
BEGIN
    CREATE INDEX [IX_MediaAssets_UploadedBy] ON [MediaAssets] ([UploadedBy]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004073342_AddMediaAssets'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261004073342_AddMediaAssets', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004081259_AddVehicles'
)
BEGIN
    CREATE TABLE [Vehicles] (
        [Id] uniqueidentifier NOT NULL,
        [Slug] nvarchar(100) NOT NULL,
        [SegmentId] uniqueidentifier NULL,
        [Name] nvarchar(max) NOT NULL,
        [Tagline] nvarchar(max) NULL,
        [Description] nvarchar(max) NULL,
        [Image] nvarchar(max) NULL,
        [Gallery] nvarchar(max) NOT NULL,
        [Badge] nvarchar(max) NULL,
        [BadgeTone] nvarchar(20) NULL,
        [Rating] nvarchar(20) NULL,
        [Guarantee] nvarchar(max) NULL,
        [Specs] nvarchar(max) NOT NULL,
        [DetailedSpecs] nvarchar(max) NOT NULL,
        [Delivery] nvarchar(max) NULL,
        [Office] nvarchar(max) NULL,
        [DriverRequirements] nvarchar(max) NOT NULL,
        [Deposit] decimal(18,2) NOT NULL,
        [KmLimit] int NULL,
        [ExtraKmPrice] decimal(18,2) NULL,
        [Extras] nvarchar(max) NOT NULL,
        [SeoTitle] nvarchar(max) NULL,
        [SeoDescription] nvarchar(max) NULL,
        [SeoKeywords] nvarchar(max) NULL,
        [OgImage] nvarchar(max) NULL,
        [DefaultDailyPrice] decimal(18,2) NOT NULL,
        [Currency] nvarchar(3) NOT NULL,
        [IsFeatured] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_Vehicles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Vehicles_VehicleSegments_SegmentId] FOREIGN KEY ([SegmentId]) REFERENCES [VehicleSegments] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004081259_AddVehicles'
)
BEGIN
    CREATE INDEX [IX_Vehicles_IsActive_IsFeatured] ON [Vehicles] ([IsActive], [IsFeatured]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004081259_AddVehicles'
)
BEGIN
    CREATE INDEX [IX_Vehicles_SegmentId] ON [Vehicles] ([SegmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004081259_AddVehicles'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Vehicles_Slug] ON [Vehicles] ([Slug]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004081259_AddVehicles'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261004081259_AddVehicles', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    CREATE TABLE [CultureTours] (
        [Id] uniqueidentifier NOT NULL,
        [Nights] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        [Slug] nvarchar(100) NOT NULL,
        [CategoryId] uniqueidentifier NULL,
        [Title] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [LongDescription] nvarchar(max) NULL,
        [Image] nvarchar(max) NULL,
        [Gallery] nvarchar(max) NOT NULL,
        [Badge] nvarchar(max) NULL,
        [BadgeTone] nvarchar(20) NULL,
        [Duration] nvarchar(50) NULL,
        [Transport] nvarchar(max) NULL,
        [TransportIcon] nvarchar(100) NULL,
        [Badges] nvarchar(max) NOT NULL,
        [RoutePills] nvarchar(max) NOT NULL,
        [QuickSpecs] nvarchar(max) NOT NULL,
        [Editorial] nvarchar(max) NULL,
        [Itinerary] nvarchar(max) NOT NULL,
        [Inclusions] nvarchar(max) NULL,
        [TravelNotes] nvarchar(max) NOT NULL,
        [SeatsTotal] int NOT NULL,
        [SeoTitle] nvarchar(max) NULL,
        [SeoDescription] nvarchar(max) NULL,
        [SeoKeywords] nvarchar(max) NULL,
        [OgImage] nvarchar(max) NULL,
        [DefaultBasePrice] decimal(18,2) NOT NULL,
        [Currency] nvarchar(3) NOT NULL,
        [IsFeatured] bit NOT NULL,
        CONSTRAINT [PK_CultureTours] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CultureTours_TourCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [TourCategories] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    CREATE TABLE [DailyTours] (
        [Id] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        [Slug] nvarchar(100) NOT NULL,
        [CategoryId] uniqueidentifier NULL,
        [Title] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [LongDescription] nvarchar(max) NULL,
        [Image] nvarchar(max) NULL,
        [Gallery] nvarchar(max) NOT NULL,
        [Badge] nvarchar(max) NULL,
        [BadgeTone] nvarchar(20) NULL,
        [Duration] nvarchar(50) NULL,
        [Transport] nvarchar(max) NULL,
        [TransportIcon] nvarchar(100) NULL,
        [Badges] nvarchar(max) NOT NULL,
        [RoutePills] nvarchar(max) NOT NULL,
        [QuickSpecs] nvarchar(max) NOT NULL,
        [Editorial] nvarchar(max) NULL,
        [Itinerary] nvarchar(max) NOT NULL,
        [Inclusions] nvarchar(max) NULL,
        [TravelNotes] nvarchar(max) NOT NULL,
        [SeatsTotal] int NOT NULL,
        [SeoTitle] nvarchar(max) NULL,
        [SeoDescription] nvarchar(max) NULL,
        [SeoKeywords] nvarchar(max) NULL,
        [OgImage] nvarchar(max) NULL,
        [DefaultBasePrice] decimal(18,2) NOT NULL,
        [Currency] nvarchar(3) NOT NULL,
        [IsFeatured] bit NOT NULL,
        CONSTRAINT [PK_DailyTours] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_DailyTours_TourCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [TourCategories] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    CREATE INDEX [IX_CultureTours_CategoryId] ON [CultureTours] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    CREATE INDEX [IX_CultureTours_IsActive_IsFeatured] ON [CultureTours] ([IsActive], [IsFeatured]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_CultureTours_Slug] ON [CultureTours] ([Slug]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    CREATE INDEX [IX_DailyTours_CategoryId] ON [DailyTours] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    CREATE INDEX [IX_DailyTours_IsActive_IsFeatured] ON [DailyTours] ([IsActive], [IsFeatured]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_DailyTours_Slug] ON [DailyTours] ([Slug]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004092103_AddTours'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261004092103_AddTours', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004093849_AddBungalows'
)
BEGIN
    CREATE TABLE [Bungalows] (
        [Id] uniqueidentifier NOT NULL,
        [Slug] nvarchar(100) NOT NULL,
        [RegionId] uniqueidentifier NULL,
        [Title] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [LongDescription] nvarchar(max) NULL,
        [Location] nvarchar(max) NULL,
        [Image] nvarchar(max) NULL,
        [Gallery] nvarchar(max) NOT NULL,
        [BreakfastIncluded] bit NOT NULL,
        [BreakfastNote] nvarchar(max) NULL,
        [BreakfastCard] nvarchar(max) NULL,
        [Capacity] nvarchar(max) NULL,
        [Amenities] nvarchar(max) NOT NULL,
        [FeatureStrip] nvarchar(max) NOT NULL,
        [DetailedAmenities] nvarchar(max) NOT NULL,
        [Distances] nvarchar(max) NOT NULL,
        [LocationNote] nvarchar(max) NULL,
        [Rules] nvarchar(max) NOT NULL,
        [RatingLabel] nvarchar(max) NULL,
        [RatingScore] decimal(4,2) NULL,
        [RatingCount] int NULL,
        [SeoTitle] nvarchar(max) NULL,
        [SeoDescription] nvarchar(max) NULL,
        [SeoKeywords] nvarchar(max) NULL,
        [OgImage] nvarchar(max) NULL,
        [DefaultPricePerNight] decimal(18,2) NOT NULL,
        [Currency] nvarchar(3) NOT NULL,
        [IsFeatured] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_Bungalows] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Bungalows_BungalowRegions_RegionId] FOREIGN KEY ([RegionId]) REFERENCES [BungalowRegions] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004093849_AddBungalows'
)
BEGIN
    CREATE INDEX [IX_Bungalows_IsActive_IsFeatured] ON [Bungalows] ([IsActive], [IsFeatured]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004093849_AddBungalows'
)
BEGIN
    CREATE INDEX [IX_Bungalows_RegionId] ON [Bungalows] ([RegionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004093849_AddBungalows'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Bungalows_Slug] ON [Bungalows] ([Slug]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004093849_AddBungalows'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261004093849_AddBungalows', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    CREATE TABLE [AgePriceRules] (
        [Id] uniqueidentifier NOT NULL,
        [OwnerType] nvarchar(20) NOT NULL,
        [OwnerId] uniqueidentifier NOT NULL,
        [MinAge] int NOT NULL,
        [MaxAge] int NOT NULL,
        [Type] nvarchar(20) NOT NULL,
        [Price] decimal(18,2) NULL,
        [Percentage] decimal(5,2) NULL,
        [Label] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_AgePriceRules] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    CREATE TABLE [CultureTourAccommodationPrices] (
        [Id] uniqueidentifier NOT NULL,
        [CultureTourId] uniqueidentifier NOT NULL,
        [AccommodationTypeId] uniqueidentifier NOT NULL,
        [PricePerPerson] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_CultureTourAccommodationPrices] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CultureTourAccommodationPrices_AccommodationTypes_AccommodationTypeId] FOREIGN KEY ([AccommodationTypeId]) REFERENCES [AccommodationTypes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CultureTourAccommodationPrices_CultureTours_CultureTourId] FOREIGN KEY ([CultureTourId]) REFERENCES [CultureTours] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    CREATE TABLE [PriceRules] (
        [Id] uniqueidentifier NOT NULL,
        [OwnerType] nvarchar(20) NOT NULL,
        [OwnerId] uniqueidentifier NOT NULL,
        [StartDate] date NOT NULL,
        [EndDate] date NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [Priority] int NOT NULL,
        [Label] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_PriceRules] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    CREATE TABLE [TourSessions] (
        [Id] uniqueidentifier NOT NULL,
        [TourType] nvarchar(20) NOT NULL,
        [TourId] uniqueidentifier NOT NULL,
        [Date] date NOT NULL,
        [Seats] int NOT NULL,
        [PriceOverride] decimal(18,2) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_TourSessions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    CREATE INDEX [IX_AgePriceRules_OwnerType_OwnerId] ON [AgePriceRules] ([OwnerType], [OwnerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    CREATE INDEX [IX_CultureTourAccommodationPrices_AccommodationTypeId] ON [CultureTourAccommodationPrices] ([AccommodationTypeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_CultureTourAccommodationPrices_CultureTourId_AccommodationTypeId] ON [CultureTourAccommodationPrices] ([CultureTourId], [AccommodationTypeId]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    CREATE INDEX [IX_PriceRules_OwnerType_OwnerId] ON [PriceRules] ([OwnerType], [OwnerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_TourSessions_TourType_TourId_Date] ON [TourSessions] ([TourType], [TourId], [Date]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004094946_AddPricing'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261004094946_AddPricing', N'9.0.20');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004101901_AddSystemEntities'
)
BEGIN
    CREATE TABLE [SiteSettings] (
        [Id] uniqueidentifier NOT NULL,
        [GoogleAnalyticsId] nvarchar(50) NULL,
        [SearchConsoleToken] nvarchar(100) NULL,
        [FacebookPixelId] nvarchar(50) NULL,
        [YandexMetrikaId] nvarchar(50) NULL,
        [RobotsTxtContent] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_SiteSettings] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004101901_AddSystemEntities'
)
BEGIN
    CREATE TABLE [StaticPages] (
        [Id] uniqueidentifier NOT NULL,
        [Slug] nvarchar(100) NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [SeoTitle] nvarchar(max) NULL,
        [SeoDescription] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_StaticPages] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004101901_AddSystemEntities'
)
BEGIN
    CREATE TABLE [Testimonials] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [Initials] nvarchar(5) NOT NULL,
        [Lang] nvarchar(2) NOT NULL,
        [Text] nvarchar(2000) NOT NULL,
        [Rating] int NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [DeletedAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        CONSTRAINT [PK_Testimonials] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004101901_AddSystemEntities'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_StaticPages_Slug] ON [StaticPages] ([Slug]) WHERE [DeletedAt] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261004101901_AddSystemEntities'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261004101901_AddSystemEntities', N'9.0.20');
END;

COMMIT;
GO

