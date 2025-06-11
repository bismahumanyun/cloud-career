﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerCloud.Pocos
{
    
    [Table("Applicant_Work_History")]
    public class ApplicantWorkHistoryPoco : IPoco
    {
        [Key]
        public Guid Id { get; set; }

        //Changed Applicant to Guid from int to pass the unit test cases of the assignment 2
        //public int Applicant { get; set; }
        public Guid Applicant { get; set; }
        
        [Column("Company_Name")]
        public string CompanyName { get; set; }
        
        [Column("Country_Code")]   
        public string CountryCode { get; set; }
        
        [Column("Location")]
        public string Location { get; set; }
        
        [Column("Job_Title")]
        public string JobTitle { get; set; }
       
        [Column("Job_Description")]
        public string JobDescription { get; set; }
       
        [Column("Start_Month")]
        public short StartMonth { get; set; }
        
        [Column("Start_Year")]
        public int StartYear { get; set; }

        [Column("End_Month")]
        public short EndMonth { get; set; }
        
        [Column("End_Year")]
        public int EndYear { get; set; }
        
        [Column("Time_Stamp")]
        [NotMapped]
        public byte[] TimeStamp { get; set; }
        public virtual ApplicantProfilePoco ApplicantProfile { get; set; }
        public virtual SystemCountryCodePoco SystemCountryCode { get; set; }

    }
}
