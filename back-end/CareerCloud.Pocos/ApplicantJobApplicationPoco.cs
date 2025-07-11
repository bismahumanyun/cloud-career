﻿using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CareerCloud.Pocos
{
   
    [Table("Applicant_Job_Applications")]
    public class ApplicantJobApplicationPoco : IPoco
    {
        [Key]
        public Guid Id { get; set; }
        
        public Guid Applicant { get; set; }
        
        public Guid Job { get; set; }
        
        [Column("Application_Date")]
        public DateTime ApplicationDate { get; set; }

        [Column("Time_Stamp")]
        [NotMapped]
        public byte[] TimeStamp { get; set; }
        public virtual ApplicantProfilePoco ApplicantProfile { get; set; }
        public virtual CompanyJobPoco CompanyJob { get; set; }
    }
}
