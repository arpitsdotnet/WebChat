using WebChat.WebUI.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

//SignalR
builder.Services.AddSignalR();
//builder.Services.AddCors(options =>
//{
//    options.AddDefaultPolicy(builder =>
//    {
//        builder.WithOrigins("https://localhost:7288")
//            .AllowAnyHeader()
//            .WithMethods("GET", "POST")
//            .SetIsOriginAllowed((host)=> true)
//            .AllowCredentials();
//    });
//});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

//SignalR
//app.UseCors();
app.MapHub<ChatHub>("/chatHub");

app.Run();
