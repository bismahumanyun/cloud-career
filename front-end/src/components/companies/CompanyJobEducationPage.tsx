import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApi, useApiList } from '../../hooks/useApi';
import { companyJobEducationService, companyJobService } from '../../services/api';
import { CompanyJobEducation } from '../../types/entities';
import { Edit, Trash2, GraduationCap, Briefcase, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';

const jobEducationSchema = z.object({
  job: z.string().min(1, 'Job ID is required'),
  major: z.string().min(1, 'Major is required'),
  importance: z.number().min(1).max(5),
});

type JobEducationFormData = z.infer<typeof jobEducationSchema>;

const importanceLabels = {
  1: 'Nice to Have',
  2: 'Preferred',
  3: 'Important',
  4: 'Very Important',
  5: 'Required'
};

const importanceColors = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800'
};

export function CompanyJobEducationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobEducation, setEditingJobEducation] = useState<CompanyJobEducation | null>(null);
  const [deletingJobEducation, setDeletingJobEducation] = useState<CompanyJobEducation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const jobEducationsApi = useApiList(companyJobEducationService.getAll);
  const jobsApi = useApiList(companyJobService.getAll);
  const createApi = useApi(companyJobEducationService.create, {
    showSuccessToast: true,
    successMessage: 'Job education requirement created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      jobEducationsApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(companyJobEducationService.update, {
    showSuccessToast: true,
    successMessage: 'Job education requirement updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingJobEducation(null);
      jobEducationsApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(companyJobEducationService.delete, {
    showSuccessToast: true,
    successMessage: 'Job education requirement deleted successfully',
    onSuccess: () => {
      setDeletingJobEducation(null);
      jobEducationsApi.refresh();
    },
  });

  // Form setup
  const form = useForm<JobEducationFormData>({
    resolver: zodResolver(jobEducationSchema),
    defaultValues: {
      job: '',
      major: '',
      importance: 3,
    },
  });

  // Load jobs on mount
  useEffect(() => {
    jobsApi.execute();
  }, []);

  // Filter job educations based on search term
  const filteredJobEducations = jobEducationsApi.data.filter(jobEd =>
    jobEd.job.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobEd.major.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<CompanyJobEducation>[] = [
    {
      key: 'job',
      label: 'Job ID',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'major',
      label: 'Major/Degree',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'importance',
      label: 'Importance',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <Badge className={importanceColors[value as keyof typeof importanceColors]}>
            {importanceLabels[value as keyof typeof importanceLabels]}
          </Badge>
        </div>
      ),
    },
    {
      key: 'timeStamp',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<CompanyJobEducation>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (jobEd) => {
        setEditingJobEducation(jobEd);
        form.reset({
          job: jobEd.job,
          major: jobEd.major,
          importance: Number(jobEd.importance),
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (jobEd) => setDeletingJobEducation(jobEd),
    },
  ];

  const handleSubmit = async (data: JobEducationFormData) => {
    if (editingJobEducation) {
      await updateApi.execute(editingJobEducation.id, data);
    } else {
      await createApi.execute(data);
    }
  };

  const handleDelete = async () => {
    if (deletingJobEducation) {
      await deleteApi.execute(deletingJobEducation.id);
    }
  };

  const openAddForm = () => {
    setEditingJobEducation(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Job Education Requirements</h1>
        <p className="text-gray-600">Manage education requirements for job positions</p>
      </div>

      <DataTable
        title="Job Education Requirements"
        data={filteredJobEducations}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={jobEducationsApi.isLoading}
        searchPlaceholder="Search by job ID or major..."
        emptyMessage="No job education requirements found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJobEducation(null);
          form.reset();
        }}
        title={editingJobEducation ? 'Edit Job Education Requirement' : 'Add Job Education Requirement'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job">Job ID *</Label>
            <Input
              id="job"
              {...form.register('job')}
              placeholder="e.g., job-001"
            />
            {form.formState.errors.job && (
              <p className="text-sm text-red-600">{form.formState.errors.job.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Major/Degree *</Label>
            <Input
              id="major"
              {...form.register('major')}
              placeholder="e.g., Computer Science, Business Administration"
            />
            {form.formState.errors.major && (
              <p className="text-sm text-red-600">{form.formState.errors.major.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="importance">Importance Level *</Label>
            <Select
              value={form.watch('importance')?.toString()}
              onValueChange={(value) => form.setValue('importance', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select importance level" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(importanceLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < parseInt(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.importance && (
              <p className="text-sm text-red-600">{form.formState.errors.importance.message}</p>
            )}
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingJobEducation} onOpenChange={() => setDeletingJobEducation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the education requirement for{' '}
              <strong>{deletingJobEducation?.major}</strong> on job {deletingJobEducation?.job}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
