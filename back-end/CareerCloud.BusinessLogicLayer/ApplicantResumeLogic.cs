﻿using CareerCloud.Pocos;
using CareerCloud.DataAccessLayer;

namespace CareerCloud.BusinessLogicLayer
{
    public class ApplicantResumeLogic : BaseLogic<ApplicantResumePoco>
    {
        public ApplicantResumeLogic(IDataRepository<ApplicantResumePoco> repository) : base(repository)
        {
        }
        protected override void Verify(ApplicantResumePoco[] pocos)
        {
            //Rules Code: 113
            List<ValidationException> exceptions = new List<ValidationException>();
            foreach (ApplicantResumePoco poco in pocos)
            {
                if (string.IsNullOrEmpty(poco.Resume))
                {
                    exceptions.Add(new ValidationException(113, "Resume field cannot be empty."));
                }
            }
             
            if (exceptions.Count > 0)
            {
                throw new AggregateException(exceptions);
            }
        }
        public override void Add(ApplicantResumePoco[] pocos)
        {            
            Verify(pocos);
            base.Add(pocos);
        }

        public override void Update(ApplicantResumePoco[] pocos)
        {            
            Verify(pocos);
            base.Update(pocos);
        }
    }
}