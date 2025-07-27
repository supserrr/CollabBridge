# Profile Management System

A comprehensive profile management system for the CollabBridge platform that allows users to update their profile pictures, edit their professional information, change usernames, and manage portfolios.

## Features Overview

### 1. Profile Picture Upload (`ProfilePictureUpload`)
- **File validation**: Supports image files up to 10MB
- **Preview functionality**: Shows preview before uploading
- **Avatar integration**: Integrates with UI avatar component
- **Error handling**: Comprehensive error messaging and validation

**Props:**
- `currentAvatar?: string` - Current avatar URL
- `onAvatarUpdate?: (newAvatarUrl: string) => void` - Callback when avatar is updated

### 2. Profile Information Editor (`ProfileEditForm`)
- **Role-based forms**: Different fields for Event Planners vs Creative Professionals
- **Real-time validation**: Form validation with error feedback
- **Professional details**: Business info, services, experience, social links
- **Auto-save**: Optimistic updates with backend synchronization

**Props:**
- `onProfileUpdate?: (data: ProfileData) => void` - Callback when profile is updated

**Fields for All Users:**
- Name, Bio, Location, Phone

**Additional Fields for Creative Professionals:**
- Business Name, Services, Experience, Website, Instagram, Pricing

### 3. Username Management (`UsernameChange`)
- **Availability checking**: Real-time username availability validation
- **Format validation**: Username format requirements
- **Conflict resolution**: Handles duplicate username scenarios
- **Security**: Requires authentication for changes

**Props:**
- `onUsernameUpdate?: (username: string) => void` - Callback when username is updated

**Features:**
- Minimum 3 characters, alphanumeric with underscores/hyphens
- Real-time availability checking
- URL preview showing new profile link

### 4. Portfolio Management (`PortfolioManager`)
- **Creative Professional only**: Only available for creative professionals
- **Image uploads**: Support for portfolio project images
- **Project categorization**: Wedding, Corporate, Portrait, Event, Product, Other
- **Tagging system**: Add tags for better discoverability
- **Privacy controls**: Public/private portfolio items
- **CRUD operations**: Create, read, update, delete portfolio items

**Props:**
- `onPortfolioUpdate?: (portfolio: PortfolioItem[]) => void` - Callback when portfolio is updated

**Portfolio Item Fields:**
- Title, Description, Category, Project Date, Tags, Image, Public/Private status

## Implementation Guide

### Basic Usage

```tsx
import { ProfilePictureUpload } from '@/components/profile/profile-picture-upload';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { UsernameChange } from '@/components/profile/username-change';
import { PortfolioManager } from '@/components/profile/portfolio-manager';

// Individual components
<ProfilePictureUpload onAvatarUpdate={(url) => console.log('New avatar:', url)} />
<ProfileEditForm onProfileUpdate={(data) => console.log('Profile updated:', data)} />
<UsernameChange onUsernameUpdate={(username) => console.log('Username:', username)} />
<PortfolioManager onPortfolioUpdate={(portfolio) => console.log('Portfolio:', portfolio)} />
```

### Comprehensive Profile Manager

```tsx
import { ComprehensiveProfileManager } from '@/components/profile/comprehensive-profile-manager';

<ComprehensiveProfileManager 
  onProfileUpdate={() => {
    // Handle any profile update
    console.log('Profile updated');
  }}
/>
```

### Profile Settings Page

A complete profile settings page is available at `/profile-settings` with tabbed interface:
- **Profile Tab**: Basic profile information
- **Picture Tab**: Profile picture upload
- **Portfolio Tab**: Portfolio management (Creative Professionals only)
- **Account Tab**: Username change and account settings

## API Integration

### Required Backend Endpoints

1. **Profile Updates**: `PUT /api/profile/update`
2. **Avatar Upload**: `POST /api/upload/avatar`
3. **Username Check**: `GET /api/auth/check-username?username={username}`
4. **Username Update**: `PUT /api/auth/update-profile`
5. **Portfolio CRUD**: 
   - `GET /api/portfolio` - Get portfolio items
   - `POST /api/portfolio` - Create portfolio item
   - `PUT /api/portfolio/{id}` - Update portfolio item
   - `DELETE /api/portfolio/{id}` - Delete portfolio item

### Authentication

All API calls require authentication via Bearer token:
```javascript
const token = localStorage.getItem('auth_token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Error Handling

- **Network errors**: Graceful handling with user-friendly messages
- **Validation errors**: Real-time field validation with clear feedback
- **File upload errors**: Size and type validation with specific error messages
- **Authentication errors**: Proper error handling for expired tokens

## Accessibility

- **Keyboard navigation**: Full keyboard support for all components
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus management**: Logical focus flow through forms
- **Color contrast**: Meets WCAG guidelines for text and UI elements

## Security Features

- **File validation**: Strict file type and size checking for uploads
- **Input sanitization**: All text inputs are properly sanitized
- **Authentication required**: All profile operations require valid authentication
- **CSRF protection**: Token-based request validation

## Performance Optimizations

- **Lazy loading**: Components load only when needed
- **Image optimization**: Automatic image compression and resizing
- **Debounced validation**: Username availability checking with debouncing
- **Optimistic updates**: UI updates immediately with backend sync

## Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile responsive design
- Progressive enhancement for older browsers

## Testing

Each component includes comprehensive error handling and validation that can be tested with various scenarios:

1. **Profile Picture Upload**:
   - Test with various file types and sizes
   - Test network failures during upload
   - Test with invalid file formats

2. **Profile Form**:
   - Test form validation with empty/invalid fields
   - Test role-based field visibility
   - Test auto-save functionality

3. **Username Change**:
   - Test with taken usernames
   - Test with invalid formats
   - Test availability checking

4. **Portfolio Management**:
   - Test CRUD operations
   - Test image uploads
   - Test privacy settings
