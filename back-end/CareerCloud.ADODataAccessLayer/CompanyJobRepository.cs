﻿using System.Linq.Expressions;
using CareerCloud.DataAccessLayer;
using CareerCloud.Pocos;
using Microsoft.Extensions.Configuration;
//using Microsoft.Data.SqlClient;
using System.Data.SqlClient;


namespace CareerCloud.ADODataAccessLayer
{
    public class CompanyJobRepository : IDataRepository<CompanyJobPoco>
    {
        protected readonly string _connStr = string.Empty;
        public CompanyJobRepository()
        {
            var config = new ConfigurationBuilder();
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            config.AddJsonFile(path, false);
            var root = config.Build();
            _connStr = root.GetSection("ConnectionStrings").GetSection("DataConnection").Value;
        }
        public void Add(params CompanyJobPoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = conn;
                foreach (CompanyJobPoco poco in items)
                {
                    cmd.CommandText = @"INSERT INTO dbo.Company_Jobs (Id, Company, Profile_Created, Is_Inactive, Is_Company_Hidden)
                                        VALUES (@Id, @Company, @Profile_Created, @Is_Inactive, @Is_Company_Hidden)";
                    cmd.Parameters.AddWithValue("@Id", poco.Id);
                    cmd.Parameters.AddWithValue("@Company", poco.Company);
                    cmd.Parameters.AddWithValue("@Profile_Created", poco.ProfileCreated);
                    cmd.Parameters.AddWithValue("@Is_Inactive", poco.IsInactive);
                    cmd.Parameters.AddWithValue("@Is_Company_Hidden", poco.IsCompanyHidden);
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

        public IList<CompanyJobPoco> GetAll(params Expression<Func<CompanyJobPoco, object>>[] navigationProperties)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = conn;
                cmd.CommandText = @"SELECT Id, Company, Profile_Created, Is_Inactive, Is_Company_Hidden, Time_Stamp
                                    FROM   dbo.Company_Jobs";
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                List<CompanyJobPoco> CompanyJobPocoList = new List<CompanyJobPoco>();
                while (reader.Read())
                {
                    CompanyJobPoco poco = new CompanyJobPoco();
                    poco.Id = reader.GetGuid(0);
                    poco.Company = reader.GetGuid(1);
                    poco.ProfileCreated = reader.GetDateTime(2);
                    poco.IsInactive = reader.GetBoolean(3);
                    poco.IsCompanyHidden = reader.GetBoolean(4);
                    poco.TimeStamp = (byte[])reader[5];
                    CompanyJobPocoList.Add(poco);
                }
                conn.Close();
                return CompanyJobPocoList.ToArray();
            }
        }

        public IList<CompanyJobPoco> GetList(Expression<Func<CompanyJobPoco, bool>> where, params Expression<Func<CompanyJobPoco, object>>[] navigationProperties)
        {
            throw new NotImplementedException();
        }

        public CompanyJobPoco GetSingle(Expression<Func<CompanyJobPoco, bool>> where, params Expression<Func<CompanyJobPoco, object>>[] navigationProperties)
        {
            IQueryable<CompanyJobPoco> poco = GetAll().AsQueryable();
            return poco.Where(where).FirstOrDefault();
        }

        public void Remove(params CompanyJobPoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                foreach (var poco in items)
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "DELETE FROM   dbo.Company_Jobs WHERE Id = @Id";
                        cmd.Parameters.AddWithValue("@Id", poco.Id);
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
        }

        public void Update(params CompanyJobPoco[] items)
        {
            using (SqlConnection conn = new SqlConnection(_connStr))
            {
                foreach (var poco in items)
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = @"UPDATE dbo.Company_Jobs
                                            SET    Company = @Company, Profile_Created = @Profile_Created, Is_Inactive = @Is_Inactive, Is_Company_Hidden = @Is_Company_Hidden
                                            WHERE  Id = @Id";
                        cmd.Parameters.AddWithValue("@Id", poco.Id);
                        cmd.Parameters.AddWithValue("@Company", poco.Company);
                        cmd.Parameters.AddWithValue("@Profile_Created", poco.ProfileCreated);
                        cmd.Parameters.AddWithValue("@Is_Inactive", poco.IsInactive);
                        cmd.Parameters.AddWithValue("@Is_Company_Hidden", poco.IsCompanyHidden);
                        conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
        }
    }
}
