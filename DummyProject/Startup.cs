using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(DummyProject.Startup))]
namespace DummyProject
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
