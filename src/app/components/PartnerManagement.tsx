import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Edit, Trash2, Save, X, ExternalLink, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ButtonSpinner } from './LoadingSpinner';
import { toast } from 'sonner';
import { useDarkMode } from '../contexts/DarkModeContext';

interface Partner {
  id: string;
  name: string;
  description: string;
  specializations: string[];
  website: string;
  classesLink: string;
  image: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

interface PartnerManagementProps {
  accessToken: string;
}

export function PartnerManagement({ accessToken }: PartnerManagementProps) {
  const { darkMode } = useDarkMode();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specializations: '',
    website: '',
    classesLink: '',
    image: '',
    order: 0,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/partners`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners || []);
      } else {
        toast.error('Failed to fetch partners');
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Error fetching partners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      specializations: '',
      website: '',
      classesLink: '',
      image: '',
      order: partners.length,
    });
  };

  const handleEdit = (partner: Partner) => {
    setIsCreating(false);
    setEditingId(partner.id);
    setFormData({
      name: partner.name,
      description: partner.description,
      specializations: partner.specializations.join(', '),
      website: partner.website,
      classesLink: partner.classesLink,
      image: partner.image,
      order: partner.order,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      specializations: '',
      website: '',
      classesLink: '',
      image: '',
      order: 0,
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.website) {
      toast.error('Please fill in required fields: Name, Description, and Website');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        specializations: formData.specializations
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
        website: formData.website,
        classesLink: formData.classesLink || formData.website,
        image: formData.image,
        order: formData.order,
      };

      const url = isCreating
        ? `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/partners`
        : `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/partners/${editingId}`;

      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(isCreating ? 'Partner created successfully' : 'Partner updated successfully');
        handleCancel();
        fetchPartners();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save partner');
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Error saving partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/partners/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Partner deleted successfully');
        fetchPartners();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete partner');
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Error deleting partner');
    } finally {
      setDeleting(null);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('This will remove old multilingual fields from all partners. Continue?')) {
      return;
    }

    setCleaning(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/partners/cleanup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Database cleaned successfully');
        fetchPartners();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to cleanup database');
      }
    } catch (error) {
      console.error('Error cleaning up database:', error);
      toast.error('Error cleaning up database');
    } finally {
      setCleaning(false);
    }
  };

  const cardStyle = { background: darkMode ? '#1e293b' : undefined, borderColor: darkMode ? '#334155' : undefined };

  if (loading) {
    return (
      <Card style={cardStyle}>
        <CardHeader>
          <CardTitle>Partner Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">Loading partners...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card style={cardStyle}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Partner Management</CardTitle>
          <div className="flex gap-2">
            {!isCreating && !editingId && partners.length > 0 && (
              <Button 
                onClick={handleCleanup} 
                size="sm" 
                variant="outline"
                disabled={cleaning}
                className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
              >
                {cleaning ? (
                  <ButtonSpinner />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clean Database
                  </>
                )}
              </Button>
            )}
            {!isCreating && !editingId && (
              <Button onClick={handleCreate} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Create/Edit Form */}
          {(isCreating || editingId) && (
            <Card className="mb-6 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isCreating ? 'Create New Partner' : 'Edit Partner'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Partner name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Partner description in English"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter description in English. It will be displayed in all languages.</p>
                </div>

                <div>
                  <Label htmlFor="specializations">Specializations</Label>
                  <Textarea
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                    placeholder="Comma separated: Training, Certification, Equipment"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate items with commas. Enter in English, displayed in all languages.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website URL *</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="classesLink">Classes/Services Link</Label>
                    <Input
                      id="classesLink"
                      type="url"
                      value={formData.classesLink}
                      onChange={(e) => setFormData({ ...formData, classesLink: e.target.value })}
                      placeholder="https://example.com/classes (optional)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use Unsplash or other image hosting service
                  </p>
                </div>

                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <ButtonSpinner />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isCreating ? 'Create Partner' : 'Save Changes'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Partners List */}
          {partners.length === 0 ? (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                No partners found. Click "Add Partner" to create your first partner.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {partners.map((partner) => (
                <Card key={partner.id} className="border-2" style={{ background: darkMode ? '#27374d' : undefined, borderColor: darkMode ? '#475569' : undefined }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">{partner.name}</h3>
                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {partner.description}
                        </p>
                        {partner.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {partner.specializations.slice(0, 3).map((spec, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 px-2 py-1 rounded"
                              >
                                {spec}
                              </span>
                            ))}
                            {partner.specializations.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{partner.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          Order: {partner.order} • Created: {new Date(partner.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(partner)}
                          disabled={!!editingId || isCreating || !!deleting}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(partner.id)}
                          disabled={!!editingId || isCreating || !!deleting}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleting === partner.id ? (
                            <ButtonSpinner />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}