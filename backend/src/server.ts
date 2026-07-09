import express from 'express';
// Must be imported before any routes are defined: patches Express 4's router
// so that a rejected promise (or thrown error) inside an async route handler
// is forwarded to the error-handling middleware instead of crashing the
// process as an unhandled rejection (Express 4, unlike 5, doesn't do this
// automatically).
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server } from 'http';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { logger } from './utils/logger';
import { config } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import walletRoutes from './routes/wallet.routes';
import transactionRoutes from './routes/transaction.routes';
import complianceRoutes from './routes/compliance.routes';

const app = express();
const PORT = process.env.PORT || 8000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StellarBank API',
      version: '1.4.7',
      description: 'Cross-border remittance API powered by Stellar blockchain',
      contact: {
        name: 'StellarBank Team',
        email: 'api@stellarbank.io',
        url: 'https://stellarbank.io'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.stellarbank.io/v1'
          : 'http://localhost:8000/api/v1',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://stellarbank.io', 'https://app.stellarbank.io']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Production: 100 requests per 15 minutes
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.4.7',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    stellar: {
      network: process.env.STELLAR_NETWORK || 'testnet',
      horizon: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
    }
  });
});

// API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'StellarBank API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/wallets', authMiddleware, walletRoutes);
app.use('/api/v1/transactions', authMiddleware, transactionRoutes);
app.use('/api/v1/compliance', authMiddleware, complianceRoutes);

// API versioning - redirect root API calls to v1
app.use('/api', (req, res, next) => {
  if (req.path === '/') {
    return res.redirect('/api/v1');
  }
  next();
});

// API v1 info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'StellarBank API',
    version: 'v1',
    description: 'Cross-border remittance API powered by Stellar blockchain',
    documentation: `${req.protocol}://${req.get('host')}/docs`,
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      wallets: '/api/v1/wallets',
      transactions: '/api/v1/transactions',
      compliance: '/api/v1/compliance'
    },
    status: 'active',
    supportedCountries: [
      'NG', 'GH', 'KE', 'UG', 'ZA', 'US', 'UK', 'CA', 'DE', 'FR'
    ],
    supportedCurrencies: [
      'USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES', 'UGX', 'ZAR'
    ]
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    documentation: `${req.protocol}://${req.get('host')}/docs`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

const server: Server = app.listen(PORT, () => {
  logger.info(`🚀 StellarBank API server running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    stellarNetwork: process.env.STELLAR_NETWORK || 'testnet'
  });
  
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`📚 API Documentation available at: http://localhost:${PORT}/docs`);
    logger.info(`🏥 Health check available at: http://localhost:${PORT}/health`);
  }
});

export { app, server };