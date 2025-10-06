using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data.Entity;

namespace ProjektLabor.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options)
        : IdentityDbContext<ApplicationUser>(options)
    {
        public virtual DbSet<Job> Jobs { get; set; }
        public virtual DbSet<Application> Applications { get; set; }

        override protected void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ApplicationUser>(entity => 
            {
                entity.Property(e => e.FullName).HasMaxLength(100);
                entity.Property(e => e.ResumePath).HasMaxLength(200);
            });

            builder.HasDefaultSchema("Identity");
        }
    }
}