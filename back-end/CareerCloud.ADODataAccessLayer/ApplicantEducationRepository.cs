﻿using System.Linq.Expressions;
using CareerCloud.DataAccessLayer;
using CareerCloud.Pocos;
using Microsoft.Extensions.Configuration;
//using Microsoft.Data.SqlClient;
using System.Data.SqlClient;

namespace CareerCloud.ADODataAccessLayer
{   
    public class ApplicantEducationRepository : IDataRepository<ApplicantEducationPoco>

    {
        protected readonly string _connStr = string.Empty;
        public ApplicantEducationRepository()
        {
            var config = new ConfigurationBuilder();
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            config.AddJsonFile(path, false);
            var root = config.Build();
            _connStr = root.GetSection("ConnectionStrings").GetSection("DataConnection").Value;
        }
        public void Add(params ApplicantEducationPoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = conn;
                foreach (ApplicantEducationPoco poco in items)
                {
                    cmd.CommandText = @"INSERT INTO dbo.Applicant_Educations 
                                        (Id, Applicant, Major, Certificate_Diploma, Start_Date, Completion_Date, Completion_Percent)
                                        VALUES (@Id, @Applicant, @Major, @Certificate_Diploma, @Start_Date, @Completion_Date, @Completion_Percent)";
                    cmd.Parameters.AddWithValue("@Id", poco.Id);
                    cmd.Parameters.AddWithValue("@Applicant", poco.Applicant);
                    cmd.Parameters.AddWithValue("@Major", poco.Major);
                    cmd.Parameters.AddWithValue("@Certificate_Diploma", poco.CertificateDiploma);
                    cmd.Parameters.AddWithValue("@Start_Date", poco.StartDate);
                    cmd.Parameters.AddWithValue("@Completion_Date", poco.CompletionDate);
                    cmd.Parameters.AddWithValue("@Completion_Percent", poco.CompletionPercent);
                    conn.Open();
                    cmd.ExecuteNonQuery();
                    conn.Close();
                }
            }
        }

        public void CallStoredProc(string name, params Tuple<string, string>[] parameters)
        {
            throw new NotImplementedException();
        }

        public IList<ApplicantEducationPoco> GetAll(params Expression<Func<ApplicantEducationPoco, object>>[] navigationProperties)
        {            
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = conn;
                cmd.CommandText = @"SELECT Id, Applicant, Major, Certificate_Diploma, Start_Date, Completion_Date, Completion_Percent, Time_Stamp
                                    FROM   dbo.Applicant_Educations";
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();              
                List<ApplicantEducationPoco> ApplicantEducationPocoList = new List<ApplicantEducationPoco>();                
                while (reader.Read())
                {
                    ApplicantEducationPoco poco = new ApplicantEducationPoco();
                    poco.Id = reader.GetGuid(0);
                    poco.Applicant = reader.GetGuid(1);
                    poco.Major = reader.GetString(2);
                    poco.CertificateDiploma = reader.GetString(3);
                    poco.StartDate = reader.GetDateTime(4);
                    poco.CompletionDate = reader.GetDateTime(5);
                    poco.CompletionPercent = reader.GetByte(6);
                    poco.TimeStamp = (byte[])reader[7];
                    ApplicantEducationPocoList.Add(poco);
                }
                conn.Close();
                return ApplicantEducationPocoList.ToArray();
            }
        }

        public IList<ApplicantEducationPoco> GetList(Expression<Func<ApplicantEducationPoco, bool>> where, params Expression<Func<ApplicantEducationPoco, object>>[] navigationProperties)
        {
            throw new NotImplementedException();
        }

        public ApplicantEducationPoco GetSingle(Expression<Func<ApplicantEducationPoco, bool>> where, params Expression<Func<ApplicantEducationPoco, object>>[] navigationProperties)
        {
            IQueryable<ApplicantEducationPoco> poco = GetAll().AsQueryable();
            return poco.Where(where).FirstOrDefault();            
        }

        public void Remove(params ApplicantEducationPoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {              
                foreach (var poco in items)
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "DELETE FROM Applicant_Educations WHERE Id = @Id";
                        cmd.Parameters.AddWithValue("@Id", poco.Id);                                                
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
        }

        public void Update(params ApplicantEducationPoco[] items)
        {            
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                foreach (var poco in items)
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = @"UPDATE dbo.Applicant_Educations
                                            SET    Applicant = @Applicant, Major = @Major, Certificate_Diploma = @Certificate_Diploma, Start_Date = @Start_Date, Completion_Date = @Completion_Date, Completion_Percent = @Completion_Percent
                                            WHERE  Id = @Id";
                        cmd.Parameters.AddWithValue("@Id", poco.Id);
                        cmd.Parameters.AddWithValue("@Applicant", poco.Applicant);
                        cmd.Parameters.AddWithValue("@Major", poco.Major ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Certificate_Diploma", poco.CertificateDiploma ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Start_Date", poco.StartDate ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Completion_Date", poco.CompletionDate ?? (object)DBNull.Value);
                        cmd.Parameters.AddWithValue("@Completion_Percent", poco.CompletionPercent);
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();                        
                    }
                }
            }
        }
    }    
}
