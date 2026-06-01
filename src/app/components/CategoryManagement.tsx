import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  Waves,
  Ship,
  AnchorIcon,
  Sailboat,
  Compass,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { LoadingSpinner } from './LoadingSpinner';
import { useDarkMode } from '../contexts/DarkModeContext';

// Available icons for categories
const AVAILABLE_ICONS = [
  { name: 'Waves', component: Waves },
  { name: 'Ship', component: Ship },
  { name: 'Anchor', component: AnchorIcon },
  { name: 'Sailboat', component: Sailboat },
  { name: 'Compass', component: Compass },
];

// Available languages for exam categories
const AVAILABLE_LANGUAGES = [
  { code: 'bg', name: 'Bulgarian' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'fr', name: 'French' },
  { code: 'hr', name: 'Croatian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'uk', name: 'Ukrainian' },
];

// Available color gradients
const AVAILABLE_COLORS = [
  { name: 'Cyan-Sky', value: 'bg-gradient-to-br from-cyan-500 to-sky-600' },
  { name: 'Sky-Blue', value: 'bg-gradient-to-br from-sky-500 to-blue-600' },
  { name: 'Blue-Indigo', value: 'bg-gradient-to-br from-blue-600 to-indigo-700' },
  { name: 'Indigo-Purple', value: 'bg-gradient-to-br from-indigo-600 to-purple-700' },
  { name: 'Teal-Cyan', value: 'bg-gradient-to-br from-teal-500 to-cyan-600' },
  { name: 'Green-Emerald', value: 'bg-gradient-to-br from-green-500 to-emerald-600' },
  { name: 'Red-Orange', value: 'bg-gradient-to-br from-red-500 to-orange-600' },
  { name: 'Purple-Pink', value: 'bg-gradient-to-br from-purple-500 to-pink-600' },
];

const WORLD_COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia',
  'Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica',
  'Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt',
  'El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France','Gabon',
  'Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel',
  'Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos',
  'Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova',
  'Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau',
  'Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania',
  'Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal',
  'Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan',
  'Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela',
  'Vietnam','Yemen','Zambia','Zimbabwe',
];

export interface ExamCategory {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  image: string;
  country?: string;
  language?: string;
  price?: number;
  order?: number;
  expiringSoon?: boolean;
}

interface CategoryManagementProps {
  accessToken: string;
}

export function CategoryManagement({ accessToken }: CategoryManagementProps) {
  const { darkMode } = useDarkMode();
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ExamCategory | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [resettingDefaults, setResettingDefaults] = useState(false);
  const [overallPrice, setOverallPrice] = useState<number>(5);
  const [savingPrice, setSavingPrice] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Regions state
  const [regions, setRegions] = useState<string[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [newRegion, setNewRegion] = useState('');
  const [savingRegion, setSavingRegion] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ExamCategory>({
    type: '',
    title: '',
    description: '',
    icon: 'Waves',
    color: 'bg-gradient-to-br from-cyan-500 to-sky-600',
    image: '',
    country: '',
    language: '',
    price: 5,
  });

  useEffect(() => {
    loadCategories();
    loadPricingSettings();
    loadRegions();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      console.log('');
      console.log('📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥');
      console.log('[CategoryManagement] LOADING CATEGORIES');
      console.log('📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥');
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`;
      console.log('[CategoryManagement] Request URL:', url);
      console.log('[CategoryManagement] Request Method: GET');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('[CategoryManagement] Response Status:', response.status, response.statusText);
      console.log('[CategoryManagement] Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CategoryManagement] ❌ Error Response:', errorText);
        throw new Error(`Failed to load categories: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[CategoryManagement] ✅ Success Response:', data);
      console.log('[CategoryManagement] Categories Count:', data.categories?.length);
      console.log('[CategoryManagement] Categories Data:', JSON.stringify(data.categories, null, 2));
      console.log('📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥');
      console.log('[CategoryManagement] LOAD COMPLETE');
      console.log('📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥📥');
      console.log('');
      
      setCategories(data.categories || []);
    } catch (error: any) {
      console.error('[CategoryManagement] ❌ LOAD ERROR:', error);
      console.error('[CategoryManagement] Error details:', {
        message: error.message,
        stack: error.stack,
      });
      toast.error(`Failed to load categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPricingSettings = async () => {
    setLoadingPrice(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/pricing-settings`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[CategoryManagement] Could not load pricing settings, using default:', errorText);
        // Use default value instead of throwing
        setOverallPrice(5);
        return;
      }

      const data = await response.json();
      console.log('[CategoryManagement] Loaded pricing settings:', data);
      setOverallPrice(data.settings?.overallPrice || 5);
    } catch (error: any) {
      console.warn('[CategoryManagement] Error loading pricing, using default:', error.message);
      // Use default value on error - don't show error toast since it's not critical
      setOverallPrice(5);
    } finally {
      setLoadingPrice(false);
    }
  };

  const loadRegions = async () => {
    setLoadingRegions(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/regions`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setRegions(data.regions || ['Bulgaria']);
      }
    } catch {
      setRegions(['Bulgaria']);
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleAddRegion = async () => {
    const name = newRegion.trim();
    if (!name) { toast.error('Enter a country/region name'); return; }
    setSavingRegion(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/regions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: JSON.stringify({ name }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed');
      setRegions(data.regions);
      setNewRegion('');
      toast.success(`✅ "${name}" added`);
    } catch (err: any) {
      toast.error(`Failed to add region: ${err.message}`);
    } finally {
      setSavingRegion(false);
    }
  };

  const handleDeleteRegion = async (name: string) => {
    if (!confirm(`Remove "${name}" from available regions?`)) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/regions/${encodeURIComponent(name)}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed');
      setRegions(data.regions);
      toast.success(`✅ "${name}" removed`);
    } catch (err: any) {
      toast.error(`Failed to remove region: ${err.message}`);
    }
  };

  const handleAddNew = () => {
    setFormData({
      type: '',
      title: '',
      description: '',
      icon: 'Waves',
      color: 'bg-gradient-to-br from-cyan-500 to-sky-600',
      image: '',
      country: '',
      language: '',
      price: 5,
    });
    setIsAddingNew(true);
    setEditingCategory(null);
  };

  const handleEdit = (category: ExamCategory) => {
    setFormData({ ...category });
    setEditingCategory(category);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingCategory(null);
    setFormData({
      type: '',
      title: '',
      description: '',
      icon: 'Waves',
      color: 'bg-gradient-to-br from-cyan-500 to-sky-600',
      image: '',
      country: '',
      language: '',
      price: 5,
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.type || !formData.title || !formData.description || !formData.country) {
      toast.error('Please fill in all required fields including Country');
      return;
    }

    // Type must be alphanumeric and lowercase
    const typeRegex = /^[a-z0-9]+$/;
    if (!typeRegex.test(formData.type)) {
      toast.error('Category type must be lowercase alphanumeric (e.g., "jet", "newboat")');
      return;
    }

    // Check if type already exists (when adding new)
    if (isAddingNew && categories.some(c => c.type === formData.type)) {
      toast.error('A category with this type already exists');
      return;
    }

    setSavingCategory(true);
    try {
      console.log('[CategoryManagement] Saving category:', formData);
      console.log('[CategoryManagement] isUpdate:', !isAddingNew);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`;
      console.log('[CategoryManagement] Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          category: formData,
          isUpdate: !isAddingNew,
        }),
      });

      console.log('[CategoryManagement] Response status:', response.status);
      console.log('[CategoryManagement] Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('[CategoryManagement] Response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Unknown error' };
        }
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }

      const result = JSON.parse(responseText);
      console.log('[CategoryManagement] Save successful:', result);

      toast.success(isAddingNew ? '✅ Category added successfully!' : '✅ Category updated successfully!');
      handleCancel();
      await loadCategories();
    } catch (error: any) {
      console.error('[CategoryManagement] Error saving category:', error);
      console.error('[CategoryManagement] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast.error(`Failed to save category: ${error.message}`);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('This will reset all categories to the 5 default exam categories. Any custom categories will be lost. Continue?')) {
      return;
    }

    setResettingDefaults(true);
    try {
      console.log('');
      console.log('🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄');
      console.log('[CategoryManagement] RESET TO DEFAULTS CLICKED');
      console.log('🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄');
      console.log('[CategoryManagement] Access Token:', accessToken ? 'Present' : 'MISSING');
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/debug/init-categories`;
      console.log('[CategoryManagement] Request URL:', url);
      console.log('[CategoryManagement] Request Method: POST');
      console.log('[CategoryManagement] Request Headers:', {
        'Authorization': `Bearer ${accessToken?.substring(0, 20)}...`,
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log('[CategoryManagement] Response Status:', response.status, response.statusText);
      console.log('[CategoryManagement] Response OK:', response.ok);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('[CategoryManagement] Error Response:', error);
        throw new Error(error.message || 'Failed to reset categories');
      }

      const result = await response.json();
      console.log('[CategoryManagement] Success Response:', result);
      console.log('[CategoryManagement] Categories in response:', result.categories?.length);
      console.log('🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄');
      console.log('[CategoryManagement] RESET COMPLETE');
      console.log('🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄');
      console.log('');
      
      toast.success('✅ Categories reset to defaults successfully!');
      await loadCategories();
    } catch (error: any) {
      console.error('[CategoryManagement] ❌ RESET ERROR:', error);
      console.error('[CategoryManagement] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast.error(`Failed to reset categories: ${error.message}`);
    } finally {
      setResettingDefaults(false);
    }
  };

  const handleDelete = async (categoryType: string) => {
    if (!confirm(`Are you sure you want to delete the "${categoryType}" category? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories/${categoryType}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      toast.success('✅ Category deleted successfully!');
      await loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(`Failed to delete category: ${error.message}`);
    }
  };

  const handleSavePricing = async () => {
    // Validate that a price has been entered
    if (overallPrice === undefined || overallPrice === null || overallPrice === '') {
      toast.error('Please enter a price');
      return;
    }

    // Convert to number if it's a string
    const priceValue = typeof overallPrice === 'string' ? parseFloat(overallPrice) : overallPrice;
    
    // Validate the number
    if (isNaN(priceValue)) {
      toast.error('Please enter a valid number');
      return;
    }
    
    if (priceValue < 0 || priceValue > 100) {
      toast.error('Price must be between €0 and €100');
      return;
    }

    setSavingPrice(true);
    try {
      console.log('');
      console.log('💰💰💰 [CategoryManagement] SAVING PRICING');
      console.log('💰 [CategoryManagement] Price value to save:', priceValue);
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/pricing-settings`;
      console.log('💰 [CategoryManagement] Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ overallPrice: priceValue }),
      });

      const responseText = await response.text();
      console.log('💰 [CategoryManagement] Response status:', response.status);
      console.log('💰 [CategoryManagement] Response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Unknown error' };
        }
        console.error('❌ [CategoryManagement] Save failed:', errorData);
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }

      const result = JSON.parse(responseText);
      console.log('💰 [CategoryManagement] Save successful:', result);

      // Update the local state with the saved value
      setOverallPrice(priceValue);
      
      // Reload pricing settings to verify
      console.log('💰 [CategoryManagement] Reloading pricing to verify...');
      await loadPricingSettings();
      
      console.log('💰💰💰 [CategoryManagement] PRICING SAVE COMPLETE');
      console.log('');
      
      toast.success('✅ Pricing updated successfully!');
    } catch (error: any) {
      console.error('❌ [CategoryManagement] Error saving pricing:', error);
      toast.error(`Failed to save pricing: ${error.message}`);
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  const IconComponent = AVAILABLE_ICONS.find(i => i.name === formData.icon)?.component || Waves;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-500" />
                Exam Category Management
              </CardTitle>
              <CardDescription>
                Add, edit, or remove exam categories. Changes will be reflected across the entire platform.
              </CardDescription>
            </div>
            {!isAddingNew && !editingCategory && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleResetToDefaults}
                  disabled={resettingDefaults}
                  className="flex items-center gap-2"
                >
                  {resettingDefaults ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Reset to Defaults
                    </>
                  )}
                </Button>
                <Button onClick={handleAddNew} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Add/Edit Form */}
      {(isAddingNew || editingCategory) && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAddingNew ? <Plus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              {isAddingNew ? 'Add New Category' : `Edit "${editingCategory?.title}"`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Type */}
              <div>
                <Label htmlFor="type">
                  Category Type (ID) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value.toLowerCase() })}
                  placeholder="e.g., jet, small, yacht"
                  disabled={!isAddingNew}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase alphanumeric only. Cannot be changed after creation.
                </p>
              </div>

              {/* Icon */}
              <div>
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  style={{ backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f3f4f6' : '#111827', borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title (English) */}
              <div>
                <Label htmlFor="title">
                  Title (English) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Jet Ski License"
                  className="mt-1"
                />
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <select
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  style={{ backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f3f4f6' : '#111827', borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
                >
                  <option value="" disabled>Select a country...</option>
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={formData.language || ''}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  style={{ backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f3f4f6' : '#111827', borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
                >
                  <option value="">Select a language...</option>
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Gradient */}
              <div>
                <Label htmlFor="color">Color Gradient</Label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  style={{ backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f3f4f6' : '#111827', borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
                >
                  {AVAILABLE_COLORS.map((color) => (
                    <option key={color.name} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
                <div className={`mt-2 h-8 rounded ${formData.color}`}></div>
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="image">
                  Image URL <span className="text-gray-500 text-xs">(Unsplash recommended)</span>
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1"
                />
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="mt-2 h-24 w-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                    }}
                  />
                )}
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">
                  Monthly Price (€)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    if (value !== undefined && value > 10) {
                      toast.error('Maximum price is €10.00');
                      return;
                    }
                    setFormData({ ...formData, price: value });
                  }}
                  placeholder="5.00"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Monthly subscription price in euros. Default: €5.00, Maximum: €10.00
                </p>
              </div>

              {/* Expiring Soon Flag */}
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="expiringSoon"
                  checked={formData.expiringSoon || false}
                  onChange={(e) => setFormData({ ...formData, expiringSoon: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Label htmlFor="expiringSoon" className="cursor-pointer">
                  <span className="font-medium">Mark as "Expiring Soon"</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    When enabled, this category cannot be purchased (existing users retain access)
                  </p>
                </Label>
              </div>
            </div>

            {/* Description (English) */}
            <div>
              <Label htmlFor="description">
                Description (English) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Master jet ski operation and safety procedures"
                className="mt-1"
                rows={3}
              />
            </div>


            {/* Icon Preview */}
            <div>
              <Label>Preview</Label>
              <div className={`mt-2 p-4 rounded-lg ${formData.color} text-white flex items-center gap-3`}>
                <IconComponent className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">{formData.title || 'Category Title'}</h3>
                  <p className="text-sm opacity-90">{formData.description || 'Category description'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={savingCategory}
                className="flex items-center gap-2"
              >
                {savingCategory ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Category
                  </>
                )}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline"
                disabled={savingCategory}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = AVAILABLE_ICONS.find(i => i.name === category.icon)?.component || Waves;
          
          return (
            <Card key={category.type} className="overflow-hidden">
              <div className={`h-32 ${category.color} relative`}>
                {category.image && (
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="mb-3">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">
                      {category.type}
                    </Badge>
                    {category.expiringSoon && (
                      <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{category.title}</h3>
                  {category.country && (
                    <p className="text-xs text-gray-500 mt-0.5">📍 {category.country}</p>
                  )}
                  {category.language && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      🌐 {AVAILABLE_LANGUAGES.find(l => l.code === category.language)?.name ?? category.language}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                  {category.price && (
                    <p className="text-sm font-semibold mt-2" style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}>
                      €{category.price.toFixed(2)}/month
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleEdit(category)}
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(category.type)}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && !isAddingNew && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            No categories found. Click "Add Category" to create your first exam category.
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-500" />
            Pricing Settings
          </CardTitle>
          <CardDescription>
            Set the overall monthly price for all exam categories.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall Price */}
            <div>
              <Label htmlFor="overallPrice">
                Overall Monthly Price (€)
              </Label>
              <Input
                id="overallPrice"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={overallPrice || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  if (value !== undefined && value > 100) {
                    toast.error('Maximum price is €100.00');
                    return;
                  }
                  setOverallPrice(value);
                }}
                placeholder="5.00"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Monthly subscription price in euros. Default: €5.00, Maximum: €100.00
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSavePricing} 
              disabled={savingPrice}
              className="flex items-center gap-2"
            >
              {savingPrice ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Pricing
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-500" />
            Regions / Countries
          </CardTitle>
          <CardDescription>
            Manage which countries/regions appear in the navigation selector. Users will see only exams for their selected region.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingRegions ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {regions.map((reg) => (
                  <div key={reg} className="flex items-center gap-1 rounded-full px-3 py-1 text-sm" style={{ backgroundColor: darkMode ? 'rgba(8,47,73,0.4)' : '#f0f9ff', border: `1px solid ${darkMode ? '#075985' : '#bae6fd'}`, color: darkMode ? '#bae6fd' : '#075985' }}>
                    <span>{reg}</span>
                    <button
                      onClick={() => handleDeleteRegion(reg)}
                      className="ml-1 text-sky-500 hover:text-red-500 transition-colors font-bold leading-none"
                      title={`Remove ${reg}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {regions.length === 0 && (
                  <p className="text-sm text-gray-500">No regions configured.</p>
                )}
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="newRegion">Add Region / Country</Label>
                  <select
                    id="newRegion"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    style={{ backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f3f4f6' : '#111827', borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
                  >
                    <option value="" disabled>Select a country to add...</option>
                    {WORLD_COUNTRIES.filter((c) => !regions.includes(c)).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleAddRegion}
                  disabled={savingRegion || !newRegion}
                  className="flex items-center gap-2"
                >
                  {savingRegion ? <LoadingSpinner size="sm" /> : <Plus className="w-4 h-4" />}
                  Add
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}