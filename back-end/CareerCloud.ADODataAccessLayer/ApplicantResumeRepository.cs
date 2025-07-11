﻿using System.Linq.Expressions;
using CareerCloud.DataAccessLayer;
using CareerCloud.Pocos;
using Microsoft.Extensions.Configuration;
//using Microsoft.Data.SqlClient;
using System.Data.SqlClient;
using System.Linq;
namespace CareerCloud.ADODataAccessLayer
{

    public class ApplicantResumeRepository : IDataRepository<ApplicantResumePoco>
    {
        protected readonly string _connStr = string.Empty;
        public ApplicantResumeRepository()
        {
            var config = new ConfigurationBuilder();
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            config.AddJsonFile(path, false);
            var root = config.Build();
            _connStr = root.GetSection("ConnectionStrings").GetSection("DataConnection").Value;
        }
        public void Add(params ApplicantResumePoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = conn;
                foreach (ApplicantResumePoco poco in items)
                {
                    cmd.CommandText = @"INSERT INTO dbo.Applicant_Resumes (Id, Applicant, Resume, Last_Updated)
                                        VALUES (@Id, @Applicant, @Resume, @Last_Updated)";
                    cmd.Parameters.AddWithValue("@Id", poco.Id);
                    cmd.Parameters.AddWithValue("@Applicant", poco.Applicant);
                    cmd.Parameters.AddWithValue("@Resume", poco.Resume);
                    cmd.Parameters.AddWithValue("@Last_Updated", poco.LastUpdated);
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

        public IList<ApplicantResumePoco> GetAll(params Expression<Func<ApplicantResumePoco, object>>[] navigationProperties)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = conn;
                cmd.CommandText = @"SELECT Id, Applicant, Resume, Last_Updated
                                    FROM   dbo.Applicant_Resumes";
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                List<ApplicantResumePoco> ApplicantResumePocoList = new List<ApplicantResumePoco>();
                while (reader.Read())
                {
                    ApplicantResumePoco poco = new ApplicantResumePoco();
                    poco.Id = reader.GetGuid(0);
                    poco.Applicant = reader.GetGuid(1);
                    poco.Resume = reader.GetString(2);
                    poco.LastUpdated = reader.IsDBNull(3) ? (DateTime?)null : reader.GetDateTime(3);
                    ApplicantResumePocoList.Add(poco);
                }
                conn.Close();
                return ApplicantResumePocoList.ToArray();
            }
        }

        public IList<ApplicantResumePoco> GetList(Expression<Func<ApplicantResumePoco, bool>> where, params Expression<Func<ApplicantResumePoco, object>>[] navigationProperties)
        {
            throw new NotImplementedException();
        }

        public ApplicantResumePoco GetSingle(Expression<Func<ApplicantResumePoco, bool>> where, params Expression<Func<ApplicantResumePoco, object>>[] navigationProperties)
        {
            IQueryable<ApplicantResumePoco> poco = GetAll().AsQueryable();
            return poco.Where(where).FirstOrDefault();
        }

        public void Remove(params ApplicantResumePoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                foreach (var poco in items)
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "DELETE FROM dbo.Applicant_Resumes WHERE  Id = @Id";
                        cmd.Parameters.AddWithValue("@Id", poco.Id);
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
        }

        public void Update(params ApplicantResumePoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                foreach (var poco in items)
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = @"UPDATE dbo.Applicant_Resumes
                                            SET    Applicant = @Applicant, Resume = @Resume, Last_Updated = @Last_Updated
                                            WHERE  Id = @Id";
                        cmd.Parameters.AddWithValue("@Id", poco.Id);
                        cmd.Parameters.AddWithValue("@Applicant", poco.Applicant);
                        cmd.Parameters.AddWithValue("@Resume", poco.Resume);
                        cmd.Parameters.AddWithValue("@Last_Updated", poco.LastUpdated);
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
        }
    }
}
