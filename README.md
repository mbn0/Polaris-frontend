# Polaris Learning System - Frontend Client

[![Angular](https://img.shields.io/badge/Angular-19.2-DD0031?style=flat-square&logo=angular)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)]()
[![Angular Material](https://img.shields.io/badge/Angular%20Material-19.2-009688?style=flat-square)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-06B6D4?style=flat-square&logo=tailwind-css)]()

The Polaris Learning System frontend is a modern, responsive web application built with Angular 19, designed to provide an intuitive and engaging educational experience for cryptography learning and assessment management.

## 🏗️ Architecture Overview

The frontend follows Angular best practices with a modular architecture:

- **Component-based Architecture**: Reusable UI components with clear separation of concerns
- **Service Layer**: Centralized business logic and API communication
- **Reactive Programming**: RxJS for efficient data flow and state management
- **Route Guards**: Authentication and authorization protection
- **Lazy Loading**: Optimized module loading for better performance
- **Responsive Design**: Mobile-first approach with Angular Material and Tailwind CSS

## 🚀 Features

### User Experience
- **Multi-role Interface**: Tailored experiences for Students, Instructors, and Administrators
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with Angular Material components
- **Real-time Updates**: Live feedback and assessment updates
- **Interactive Learning**: Engaging cryptographic tools and visualizations

### Student Features
- **Dashboard**: Personal learning progress and upcoming assessments
- **Interactive Assessments**: Cryptography problem-solving with real-time feedback
- **Results Tracking**: Comprehensive view of assessment history and performance
- **Feedback System**: Communication channel with instructors
- **Cryptographic Tools**: Interactive learning modules for hands-on practice

### Instructor Features
- **Section Management**: Organize and manage course sections
- **Assessment Creation**: Build and customize cryptographic assessments
- **Student Monitoring**: Track student progress and performance
- **Feedback Management**: Respond to student queries and provide guidance
- **Visibility Controls**: Manage assessment availability and timing

### Administrator Features
- **User Management**: Complete user lifecycle administration
- **System Monitoring**: Overview of system performance and usage
- **Content Management**: Global system settings and configurations
- **Analytics Dashboard**: Comprehensive reporting and analytics

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (version 18.13.0 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Angular CLI](https://angular.io/cli) (version 19.2.11 or higher)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd polaris/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create environment files for different configurations:

**src/environments/environment.development.ts**
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7040/api',
  appUrl: 'http://localhost:4200'
};
```

**src/environments/environment.production.ts**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  appUrl: 'https://your-app-domain.com'
};
```

### 4. Development Server
Start the development server:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200/` with automatic reload on file changes.

### 5. Building for Production
```bash
npm run build
# or
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## 🎨 UI/UX Design

### Design System
- **Angular Material**: Consistent Material Design components
- **Tailwind CSS**: Utility-first CSS framework for custom styling
- **Responsive Grid**: Flexible layout system for all screen sizes
- **Dark/Light Theme**: Theme switching capability (if implemented)
- **Accessibility**: WCAG 2.1 AA compliant design

### Component Library
- **Shared Components**: Reusable UI elements across the application
- **Feature Modules**: Domain-specific component collections
- **Layout Components**: Header, sidebar, footer, and page containers
- **Form Components**: Consistent form controls and validation display

## 🔧 Development

### Code Scaffolding
Generate new components, services, and other Angular artifacts:

```bash
# Generate a new component
ng generate component feature/component-name

# Generate a new service
ng generate service services/service-name

# Generate a new module
ng generate module features/feature-name --routing

# Generate a guard
ng generate guard guards/auth

# View all available schematics
ng generate --help
```

### Project Structure
```
src/
├── app/
│   ├── components/          # Shared UI components
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication module
│   │   ├── student/        # Student-specific features
│   │   ├── instructor/     # Instructor-specific features
│   │   └── admin/          # Admin-specific features
│   ├── guards/             # Route guards
│   ├── interceptors/       # HTTP interceptors
│   ├── models/             # TypeScript interfaces and models
│   ├── services/           # Application services
│   └── shared/             # Shared utilities and modules
├── assets/                 # Static assets
├── environments/           # Environment configurations
└── styles/                 # Global styles and themes
```

### Development Guidelines

#### Code Style
- Follow Angular Style Guide
- Use TypeScript strict mode
- Implement OnPush change detection where appropriate
- Use reactive forms over template-driven forms
- Implement proper error handling

#### Component Development
```typescript
// Example component structure
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent implements OnInit, OnDestroy {
  // Properties
  data$ = this.service.getData();
  
  // Lifecycle
  ngOnInit(): void { }
  ngOnDestroy(): void { }
  
  // Methods
  handleAction(): void { }
}
```

#### Service Development
```typescript
// Example service structure
@Injectable({
  providedIn: 'root'
})
export class ExampleService {
  constructor(private http: HttpClient) {}
  
  getData(): Observable<Data[]> {
    return this.http.get<Data[]>(`${environment.apiUrl}/data`);
  }
}
```

## 🧪 Testing

### Unit Testing
Run unit tests with Karma:

```bash
npm test
# or
ng test
```

### Test Coverage
Generate test coverage report:

```bash
ng test --code-coverage
```

Coverage reports will be available in the `coverage/` directory.

### End-to-End Testing
The project includes comprehensive E2E tests for cryptographic functionality in the `tests/` directory:

```bash
# Run all cryptography tests
cd tests
chmod +x run_all_tests.sh
./run_all_tests.sh
```

### Writing Tests
```typescript
// Example unit test
describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExampleComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Features
- Adaptive navigation (hamburger menu on mobile)
- Flexible grid layouts
- Touch-friendly interactive elements
- Optimized typography scaling

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Session timeout handling

### Authorization
- Role-based route protection
- Component-level access controls
- API request authorization
- Secure form handling

### Security Best Practices
- XSS protection through Angular's built-in sanitization
- CSRF protection with proper headers
- Secure HTTP-only communication
- Input validation and sanitization

## 🚀 Deployment

### Development Build
```bash
ng build --configuration development
```

### Production Build
```bash
ng build --configuration production
```

### Serve Static Files
```bash
# After building
cd dist/frontend
npx http-server
```

### Docker Deployment
Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration
Use environment variables for dynamic configuration:

```bash
# Build with specific environment
ng build --configuration production --output-path dist/prod

# Set API URL at build time
API_URL=https://api.example.com ng build --configuration production
```

## ⚡ Performance Optimization

### Implemented Optimizations
- Lazy loading of feature modules
- OnPush change detection strategy
- TrackBy functions for ngFor loops
- Optimized bundle sizes with tree shaking
- Service worker for caching (if enabled)

### Performance Monitoring
```bash
# Bundle analysis
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/frontend/stats.json
```

## 🎯 Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes following coding standards
3. Write/update unit tests
4. Ensure all tests pass
5. Update documentation if needed
6. Submit pull request

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits for changelog generation

## 📞 Support & Troubleshooting

### Common Issues

**Module Not Found Errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build Errors**
```bash
ng cache clean
npm run build
```

**Development Server Issues**
```bash
ng serve --port 4201 --open
```

### Getting Help
1. Check the browser console for errors
2. Verify API connectivity and authentication
3. Ensure environment configuration is correct
4. Review Angular CLI documentation
5. Check for version compatibility issues

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Material Components](https://material.angular.io/components)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

This project is part of the Polaris Learning System for cryptography education.

---

**Built with ❤️ for interactive cryptography education**
