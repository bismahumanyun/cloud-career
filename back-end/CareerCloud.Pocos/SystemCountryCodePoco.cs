﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerCloud.Pocos
{
        
    [Table("System_Country_Codes")]
    public class SystemCountryCodePoco
    {
        [Key]
        public string Code { get; set; }
        public string Name { get; set; }
        public virtual ICollection<ApplicantProfilePoco> ApplicantProfiles { get; set; }
        //public virtual ICollection<ApplicantWorkHistoryPoco> ApplicantWorkHistory { get; set; }
        public virtual ICollection<ApplicantWorkHistoryPoco> ApplicantWorkHistories { get; set; }

    }
}
