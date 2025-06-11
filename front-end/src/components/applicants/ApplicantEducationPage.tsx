import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useApi, useApiList } from '../../hooks/useApi';
import { applicantEducationService } from '../../services/api';
import { ApplicantEducation } from '../../types/entities';
import { Edit, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
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
import { Badge } from '../ui/badge';

const educationSchema = z.object({
  applicant: z.string().min(1, 'Applicant ID is required'),
  major: z.string().optional(),
  minor: z.string().optional(),
  schoolDiploma: z.string().optional(),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
  completionPercent: z.number().min(0).max(100).optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

export function ApplicantEducationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<ApplicantEducation | null>(null);
  const [deletingEducation, setDeletingEducation] = useState<ApplicantEducation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const educationApi = useApiList(applicantEducationService.getAll);
  const createApi = useApi(applicantEducationService.create, {
    showSuccessToast: true,
    successMessage: 'Education record created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      educationApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(applicantEducationService.update, {
    showSuccessToast: true,
    successMessage: 'Education record updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingEducation(null);
      educationApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(applicantEducationService.delete, {
    showSuccessToast: true,
    successMessage: 'Education record deleted successfully',
    onSuccess: () => {
      setDeletingEducation(null);
      educationApi.refresh();
    },
  });

  // Form setup
  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      applicant: '',
      major: '',
      minor: '',
      schoolDiploma: '',
      startDate: '',
      completionDate: '',
      completionPercent: undefined,
    },
  });

  // Filter education records based on search term
  const filteredEducation = educationApi.data.filter(education =>
    education.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    education.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    education.schoolDiploma?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<ApplicantEducation>[] = [
    {
      key: 'applicant',
      label: 'Applicant',
      sortable: true,
    },
    {
      key: 'major',
      label: 'Major',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      key: 'minor',
      label: 'Minor',
      render: (value) => value || '-',
    },
    {
      key: 'schoolDiploma',
      label: 'School/Diploma',
      render: (value) => value || '-',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'completionDate',
      label: 'Completion Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'In Progress',
    },
    {
      key: 'completionPercent',
      label: 'Progress',
      render: (value) => {
        if (!value) return '-';
        const color = value >= 90 ? 'bg-green-100 text-green-800' : 
                     value >= 70 ? 'bg-blue-100 text-blue-800' : 
                     value >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                     'bg-red-100 text-red-800';
        return (
          <Badge className={color}>
            {value}%
          </Badge>
        );
      },
    },
    {
      key: 'timeStamp',
      label: 'Added',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<ApplicantEducation>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (education) => {
        setEditingEducation(education);
        form.reset({
          applicant: education.applicant,
          major: education.major || '',
          minor: education.minor || '',
          schoolDiploma: education.schoolDiploma || '',
          startDate: education.startDate ? education.startDate.split('T')[0] : '',
          completionDate: education.completionDate ? education.completionDate.split('T')[0] : '',
          completionPercent: education.completionPercent || undefined,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (education) => setDeletingEducation(education),
    },
  ];

  const handleSubmit = async (data: EducationFormData) => {
    const educationData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      completionDate: data.completionDate ? new Date(data.completionDate).toISOString() : null,
      completionPercent: data.completionPercent || null,
    };

    if (editingEducation) {
      await updateApi.execute(editingEducation.id, educationData);
    } else {
      await createApi.execute(educationData);
    }
  };

  const handleDelete = async () => {
    if (deletingEducation) {
      await deleteApi.execute(deletingEducation.id);
    }
  };

  const openAddForm = () => {
    setEditingEducation(null);
    form.reset();
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicant Education</h1>
        <p className="text-gray-600">Manage educational background and academic qualifications</p>
      </div>

      <DataTable
        title="Education Records"
        data={filteredEducation}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={educationApi.isLoading}
        searchPlaceholder="Search by applicant, major, or school..."
        emptyMessage="No education records found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEducation(null);
          form.reset();
        }}
        title={editingEducation ? 'Edit Education Record' : 'Add Education Record'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="applicant">Applicant ID *</Label>
            <Input
              id="applicant"
              {...form.register('applicant')}
              placeholder="Enter applicant ID"
            />
            {form.formState.errors.applicant && (
              <p className="text-sm text-red-600">{form.formState.errors.applicant.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Major</Label>
            <Input
              id="major"
              {...form.register('major')}
              placeholder="e.g., Computer Science, Business"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minor">Minor</Label>
            <Input
              id="minor"
              {...form.register('minor')}
              placeholder="e.g., Mathematics, Economics"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionPercent">Completion Percentage</Label>
            <Input
              id="completionPercent"
              type="number"
              min="0"
              max="100"
              {...form.register('completionPercent', { valueAsNumber: true })}
              placeholder="e.g., 85"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="schoolDiploma">School/Institution</Label>
            <Input
              id="schoolDiploma"
              {...form.register('schoolDiploma')}
              placeholder="Enter school name or diploma/degree"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...form.register('startDate')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionDate">Completion Date</Label>
            <Input
              id="completionDate"
              type="date"
              {...form.register('completionDate')}
            />
            <p className="text-xs text-gray-500">
              Leave empty if currently enrolled
            </p>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEducation} onOpenChange={() => setDeletingEducation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the education record for{' '}
              <strong>{deletingEducation?.applicant}</strong>
              {deletingEducation?.major && (
                <span> ({deletingEducation.major})</span>
              )}.
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
