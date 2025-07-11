﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerCloud.Pocos
{

    [Table("Company_Job_Skills")]
    public class CompanyJobSkillPoco : IPoco
    {
        [Key]
        public Guid Id { get; set; }
        
        public Guid Job { get; set; }

        public string Skill { get; set; }

        [Column("Skill_Level")]
        public string SkillLevel { get; set; }

        [Column("Importance")]
        public int Importance { get; set; }

        [Column("Time_Stamp")]
        [NotMapped]
        public byte[] TimeStamp { get; set; }
        public virtual CompanyJobPoco CompanyJob { get; set; }
    }
}
