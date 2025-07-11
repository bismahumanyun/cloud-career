﻿using CareerCloud.Pocos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CareerCloud.EntityFrameworkDataAccess
{
    public class CareerCloudContext : DbContext
    {
        // DbSet properties for each Poco
        public DbSet<CompanyLocationPoco> CompanyLocations { get; set; }
        public DbSet<CompanyJobPoco> CompanyJobs { get; set; }
        public DbSet<CompanyProfilePoco> CompanyProfiles { get; set; }
        public DbSet<SecurityLoginPoco> SecurityLogins { get; set; }
        public DbSet<SecurityRolePoco> SecurityRoles { get; set; }
        public DbSet<SystemCountryCodePoco> SystemCountryCodes { get; set; }
        public DbSet<SystemLanguageCodePoco> SystemLanguageCodes { get; set; }
        public DbSet<ApplicantProfilePoco> ApplicantProfiles { get; set; }
        public DbSet<ApplicantEducationPoco> ApplicantEducations { get; set; }
        public DbSet<ApplicantJobApplicationPoco> ApplicantJobApplications { get; set; }
        public DbSet<ApplicantSkillPoco> ApplicantSkills { get; set; }
        public DbSet<ApplicantWorkHistoryPoco> ApplicantWorkHistorys { get; set; }
        public DbSet<CompanyDescriptionPoco> CompanyDescriptions { get; set; }
        public DbSet<CompanyJobEducationPoco> CompanyJobEducations { get; set; }
        public DbSet<CompanyJobSkillPoco> CompanyJobSkills { get; set; }
        public DbSet<CompanyJobDescriptionPoco> CompanyJobDescriptions { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {            
            string _connStr;
            var config = new ConfigurationBuilder();
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            config.AddJsonFile(path, false);
            var root = config.Build();
            _connStr = root.GetSection("ConnectionStrings").GetSection("DataConnection").Value;
            optionsBuilder.UseSqlServer(_connStr);
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            #region ApplicantEducationPoco modelBuilder
            modelBuilder.Entity<ApplicantEducationPoco>(entity =>
            {
                entity.HasOne(ap => ap.ApplicantProfile)
                .WithMany(ae => ae.ApplicantEducations)
                .HasForeignKey(f => f.Applicant);
            });
            #endregion

            #region ApplicantJobApplicationPoco modelBuilder
            modelBuilder.Entity<ApplicantJobApplicationPoco>(entity =>
            {
                entity.HasOne(ap => ap.ApplicantProfile)
                .WithMany(aja => aja.ApplicantJobApplications)
                .HasForeignKey(f => f.Applicant);
            });            
            modelBuilder.Entity<ApplicantJobApplicationPoco>(entity =>
            {
                entity.HasOne(cj => cj.CompanyJob)
                .WithMany(aja => aja.ApplicantJobApplications)
                .HasForeignKey(f => f.Job);
            });
            #endregion

            #region ApplicantProfilePoco modelBuilder
            modelBuilder.Entity<ApplicantProfilePoco>(entity =>
            {
                entity.HasOne(sl => sl.SecurityLogin)
                .WithMany(ap => ap.ApplicantProfiles)
                .HasForeignKey(f => f.Login);
            });            
            modelBuilder.Entity<ApplicantProfilePoco>(entity =>
            {
                entity.HasOne(scc => scc.SystemCountryCode)
                    .WithMany(ap => ap.ApplicantProfiles)
                    .HasForeignKey(f => f.Country);
            });
            #endregion

            #region ApplicantResumePoco modelBuilder
            modelBuilder.Entity<ApplicantResumePoco>(entity =>
            {
                entity.HasOne(ap => ap.ApplicantProfile)
                .WithMany(ar => ar.ApplicantResumes)
                .HasForeignKey(f => f.Applicant);
            });
            #endregion

            #region ApplicantSkillPoco modelBuilder
            modelBuilder.Entity<ApplicantSkillPoco>(entity =>
            {
                entity.HasOne(ap => ap.ApplicantProfile)
                .WithMany(_as => _as.ApplicantSkills)
                .HasForeignKey(f => f.Applicant);
            });
            #endregion

            #region ApplicantWorkHistoryPoco modelBuilder
            modelBuilder.Entity<ApplicantWorkHistoryPoco>(entity =>
            {
                entity.HasOne(ap => ap.ApplicantProfile)
                .WithMany(awh => awh.ApplicantWorkHistorys)
                .HasForeignKey(f => f.Applicant);
            });
            modelBuilder.Entity<ApplicantWorkHistoryPoco>(entity =>
            {
                entity.HasOne(scc => scc.SystemCountryCode)
                .WithMany(awh => awh.ApplicantWorkHistories)
                .HasForeignKey(f => f.CountryCode);
            });
            #endregion

            #region CompanyDescriptionPoco modelBuilder
            modelBuilder.Entity<CompanyDescriptionPoco>(entity =>
            {
                entity.HasOne(cp => cp.CompanyProfile)
                .WithMany(cd => cd.CompanyDescriptions)
                .HasForeignKey(f => f.Company);
            });
            modelBuilder.Entity<CompanyDescriptionPoco>(entity =>
            {
                entity.HasOne(slc => slc.SystemLanguageCode)
                .WithMany(cd => cd.CompanyDescriptions)
                .HasForeignKey(f => f.LanguageId);
            });
            #endregion

            #region CompanyJobDescriptionPoco modelBuilder
            modelBuilder.Entity<CompanyJobDescriptionPoco>(entity =>
            {
                entity.HasOne(cj => cj.CompanyJob)
                .WithMany(cjd => cjd.CompanyJobDescriptions)
                .HasForeignKey(f => f.Job);
            });
            #endregion

            #region CompanyJobEducationPoco modelBuilder
            modelBuilder.Entity<CompanyJobEducationPoco>(entity =>
            {
                entity.HasOne(cj => cj.CompanyJob)
                .WithMany(cje => cje.CompanyJobEducations)
                .HasForeignKey(f => f.Job);
            });
            #endregion

            #region CompanyJobPoco modelBuilder
            modelBuilder.Entity<CompanyJobPoco>(entity =>
            {
                entity.HasOne(cp => cp.CompanyProfile)
                .WithMany(cj => cj.CompanyJobs)
                .HasForeignKey(f => f.Company);
            });
            #endregion

            #region CompanyJobSkillPoco modelBuilder
            modelBuilder.Entity<CompanyJobSkillPoco>(entity =>
            {
                entity.HasOne(cj => cj.CompanyJob)
                .WithMany(cjs => cjs.CompanyJobSkills)
                .HasForeignKey(f => f.Job);
            });
            #endregion

            #region CompanyLocationPoco modelBuilder
            modelBuilder.Entity<CompanyLocationPoco>(entity =>
            {
                entity.HasOne(cp => cp.CompanyProfile)
                .WithMany(cl => cl.CompanyLocations)
                .HasForeignKey(f => f.Company);
            });
            modelBuilder.Entity<CompanyLocationPoco>(entity =>
            {
                entity.HasOne(scc => scc.SystemCountryCode)
                .WithMany()
                .HasForeignKey(f => f.CountryCode);
            });
            #endregion

            #region SecurityLoginsLogPoco modelBuilder
            modelBuilder.Entity<SecurityLoginsLogPoco>(entity =>
            {
                entity.HasOne(sl => sl.SecurityLogin)
                .WithMany(sll => sll.SecurityLoginsLogs)
                .HasForeignKey(f => f.Login);
            });
            #endregion

            #region SecurityLoginsRolePoco modelBuilder
            modelBuilder.Entity<SecurityLoginsRolePoco>(entity =>
            {
                entity.HasOne(sl => sl.SecurityLogin)
                .WithMany(slr => slr.SecurityLoginsRoles)
                .HasForeignKey(f => f.Login);
            });
            modelBuilder.Entity<SecurityLoginsRolePoco>(entity =>
            {
                entity.HasOne(sr => sr.SecurityRole)
                .WithMany(slr => slr.SecurityLoginsRoles)
                .HasForeignKey(f => f.Role);
            });
            #endregion

            base.OnModelCreating(modelBuilder);  
        }
    }
}
