# ✅ Production Deployment Checklist

**Complete verification checklist before deploying to production.**

Use this to ensure your deployment is secure, performant, and reliable.

---

## 🔒 Security Checklist

### Secrets & Credentials

- [ ] **No secrets in code** - Search for API keys, passwords in source
  ```bash
  grep -r "sk-" backend/ frontend/ | grep -v node_modules | grep -v dist
  grep -r "password" . | grep -v node_modules | grep -v ".git"
  ```

- [ ] **.env files NOT in git** - Verify .gitignore excludes .env
  ```bash
  git log --all --full-history -- .env
  # Should show nothing or "delete" entries only
  ```

- [ ] **All secrets in environment variables** - No hardcoded values
  ```bash
  # Check backend
  grep -r "const.*=.*['\"]sk-" backend/src | grep -v test
  grep -r "const.*=.*password" backend/src | grep -v test
  ```

- [ ] **Strong database password** - 32+ random characters
  ```bash
  # Generate one if needed
  openssl rand -base64 32
  ```

- [ ] **JWT_SECRET configured** - Unique per environment
  ```bash
  # Should not be "dev-secret"
  echo $JWT_SECRET | wc -c  # Should be > 30 chars
  ```

- [ ] **ENCRYPTION_KEY set** - Different from JWT_SECRET
  ```bash
  # Should not be "dev-encryption-key"
  echo $ENCRYPTION_KEY | wc -c  # Should be > 30 chars
  ```

### Database Security

- [ ] **Database user NOT postgres** - Use api_hub_user or similar
  ```bash
  # Connection string should NOT use 'postgres' user
  echo $DATABASE_URL | grep -v "postgres:"
  ```

- [ ] **Database on private network** - Not publicly accessible
  ```bash
  # For managed DB (Railway, AWS), verify private network setting
  # Check security group/firewall rules
  ```

- [ ] **SSL enabled for database** - Especially in production
  ```bash
  # Should see 'sslmode=require' in connection string
  echo $DATABASE_URL | grep ssl
  ```

- [ ] **Regular backups configured** - Daily minimum
  ```bash
  # For managed DB: Enable automatic backups
  # For self-hosted: Setup pg_dump cron job
  ```

### API Security

- [ ] **CORS configured properly** - Only allow your domain
  ```javascript
  // In backend/src/server.js
  app.use(cors({
    origin: 'https://yourdomain.com',  // NOT *
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
  ```

- [ ] **HTTPS enforced** - No HTTP in production
  ```bash
  # Frontend should redirect HTTP to HTTPS
  # Backend should be behind reverse proxy with SSL
  ```

- [ ] **No stack traces in errors** - Errors hidden from users
  ```javascript
  // Bad:
  res.status(500).json({ error: err.stack });
  
  // Good:
  res.status(500).json({ error: "Internal server error" });
  ```

- [ ] **Input validation on ALL endpoints** - Already done, verify
  ```bash
  # Check all routes have validation middleware
  grep -r "validateConnector\|validateJSON" backend/src/routes/
  ```

- [ ] **Rate limiting configured** - If needed for your use case
  ```bash
  # Optional: Implement rate limiting
  # npm install express-rate-limit
  ```

### Frontend Security

- [ ] **No sensitive data in frontend code** - API keys, passwords
  ```bash
  grep -r "sk-\|password\|token" frontend/src --exclude-dir=node_modules
  ```

- [ ] **Content Security Policy** - If needed
  ```html
  <!-- In frontend/index.html -->
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; script-src 'self' 'unsafe-inline'; ...">
  ```

- [ ] **X-Frame-Options header** - If behind proxy/Nginx
  ```nginx
  add_header X-Frame-Options "SAMEORIGIN";
  ```

---

## ⚙️ Configuration Checklist

### Environment Variables

- [ ] **DATABASE_URL set** - Production database
  ```bash
  # Format: postgresql://user:pass@host:port/db
  # NOT localhost
  echo $DATABASE_URL | grep -v localhost
  ```

- [ ] **NODE_ENV=production** - Enables optimizations
  ```bash
  echo $NODE_ENV
  # Should output: production
  ```

- [ ] **All AI provider keys set** - At least one, ideally multiple
  ```bash
  [ -n "$ANTHROPIC_API_KEY" ] && echo "Anthropic: OK" || echo "Anthropic: MISSING"
  [ -n "$OPENAI_API_KEY" ] && echo "OpenAI: OK" || echo "OpenAI: MISSING"
  [ -n "$GEMINI_API_KEY" ] && echo "Gemini: OK" || echo "Gemini: MISSING"
  ```

- [ ] **No .env file on server** - Use environment variables only
  ```bash
  # Should not exist on production server
  ls -la /app/.env
  # Should show "No such file"
  ```

### Database Configuration

- [ ] **Migrations run on startup** - Or manually verified
  ```bash
  # Check production DB has all tables
  psql $DATABASE_URL -c "\dt"
  # Should show: connectors, request_logs, provider_keys
  ```

- [ ] **Seed data NOT in production** - Unless intentional
  ```bash
  # Check no demo connectors in production
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM connectors WHERE name LIKE '%demo%';"
  # Should return: 0 (or your expected production count)
  ```

- [ ] **Indexes created** - For performance
  ```bash
  psql $DATABASE_URL -c "\di"
  # Should show multiple indexes on connectors and request_logs
  ```

### Application Configuration

- [ ] **Logging configured** - For debugging production issues
  ```bash
  # Set LOG_LEVEL in environment if available
  # Verify logs are being collected somewhere
  ```

- [ ] **Error tracking enabled** - Sentry, DataDog, etc. (optional)
  ```bash
  [ -n "$SENTRY_DSN" ] && echo "Error tracking: enabled"
  ```

- [ ] **Performance monitoring** - Track response times
  ```bash
  # Should see metrics in your monitoring tool
  ```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] **All tests pass** - Run full test suite
  ```bash
  npm test  # in both backend/ and frontend/
  ```

- [ ] **Production build succeeds** - Frontend builds without errors
  ```bash
  cd frontend && npm run build
  # Check dist/ folder is created
  ```

- [ ] **Code reviewed** - At least one other person reviewed
  ```bash
  # Check pull request has approval
  ```

- [ ] **Database backup taken** - If migrating from existing DB
  ```bash
  pg_dump $OLD_DATABASE_URL > production_backup_$(date +%Y%m%d).sql
  ```

- [ ] **Rollback plan ready** - Know how to revert if needed
  ```bash
  # Document: How to restore from backup
  # Document: How to rollback code version
  # Document: How to restore database
  ```

### During Deployment

- [ ] **Monitor deployment logs** - Watch for errors
  ```bash
  # If using Railway/Render
  # Watch deployment logs in real-time
  docker-compose logs -f backend
  ```

- [ ] **Database migrations succeed** - All tables created
  ```bash
  # Verify via:
  psql $DATABASE_URL -c "SELECT version();"
  psql $DATABASE_URL -c "\dt"  # List tables
  ```

- [ ] **No downtime** - Or minimal downtime (< 5 min)
  ```bash
  # Test endpoint availability:
  curl -I http://yourdomain.com/health
  # Should return 200
  ```

- [ ] **SSL certificate valid** - If using HTTPS
  ```bash
  # Check certificate expiration
  echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | \
    openssl x509 -noout -dates
  ```

### Post-Deployment

- [ ] **All endpoints responding** - Test critical paths
  ```bash
  # Test health check
  curl http://yourdomain.com/health
  
  # Test API
  curl http://yourdomain.com/api/system
  
  # Test frontend loads
  curl -I http://yourdomain.com
  ```

- [ ] **Demo connectors work** - Can create and call
  ```bash
  curl -X POST http://yourdomain.com/api/connectors/card-scanner \
    -H "Content-Type: application/json" \
    -d '{"image_data": "base64..."}'
  ```

- [ ] **Database connected** - Queries working
  ```bash
  curl http://yourdomain.com/api/admin/connectors
  # Should return list of connectors
  ```

- [ ] **Logs accessible** - Can debug if needed
  ```bash
  # Verify logs are being written/collected
  # Check monitoring dashboard
  ```

- [ ] **Team notified** - Everyone knows deployment is live
  ```bash
  # Send message to team
  # Post in Slack/Discord
  # Update status page
  ```

---

## 📊 Performance Checklist

### Backend Performance

- [ ] **Response time < 1s** - Most endpoints
  ```bash
  time curl http://localhost:5000/api/admin/connectors | tail -1
  # Should complete in < 1s
  ```

- [ ] **Database queries optimized** - Using indexes
  ```bash
  # Check query plans
  psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM connectors LIMIT 10;"
  # Should use indexes, not full table scans
  ```

- [ ] **Connection pooling enabled** - For database
  ```bash
  # Already configured in backend, verify:
  echo "Check backend/src/config/database.js for Pool settings"
  ```

- [ ] **Memory usage stable** - No leaks
  ```bash
  # Check process memory
  ps aux | grep node | grep -v grep
  # Memory should stay stable over time
  ```

### Frontend Performance

- [ ] **Page loads in < 3s** - First meaningful paint
  ```bash
  # Use Lighthouse or WebPageTest
  # Target: > 90 score
  ```

- [ ] **No console errors** - Browser console clean
  ```bash
  # Open DevTools (F12) → Console
  # Should show no red errors
  ```

- [ ] **Images optimized** - Compressed, right size
  ```bash
  # Check image file sizes in dist/
  ls -lh frontend/dist/assets/*.png
  ```

- [ ] **Bundles minified** - JavaScript/CSS compressed
  ```bash
  # Check bundle sizes
  ls -lh frontend/dist/assets/*.js
  # Should be < 500KB total
  ```

### Database Performance

- [ ] **Query performance** - Most queries < 100ms
  ```bash
  # Enable slow query log
  psql $DATABASE_URL -c "SET log_min_duration_statement = 100;"
  ```

- [ ] **Connection pool not exhausted** - Max connections OK
  ```bash
  psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
  # Should be << max_connections
  ```

- [ ] **Disk space available** - Won't fill up soon
  ```bash
  df -h /var/lib/postgresql
  # Should have > 20% free space
  ```

---

## 🔍 Monitoring Checklist

### Logging

- [ ] **Error logs accessible** - Can find problems
  ```bash
  # Check log location/tool
  # Examples: CloudWatch, Datadog, Sentry, ELK
  ```

- [ ] **Access logs recorded** - Track who accessed what
  ```bash
  # If using Nginx/reverse proxy
  # Check access.log for requests
  ```

- [ ] **Audit trail available** - Track changes
  ```bash
  # Database should log schema changes
  # API should log connector creates/updates/deletes
  ```

### Alerting

- [ ] **Uptime monitoring enabled** - Alerts if down
  ```bash
  # Setup with UptimeRobot, Pingdom, etc.
  # Test by stopping service, verify alert fires
  ```

- [ ] **Error rate alerts** - Alerts if too many errors
  ```bash
  # Set threshold: alert if > 5% errors
  # Check monitoring tool dashboard
  ```

- [ ] **Performance alerts** - Warns if slow
  ```bash
  # Set threshold: alert if p95 > 5s
  # Check monitoring tool
  ```

- [ ] **Cost tracking** - Alerts if spending too much
  ```bash
  # Track AI provider usage
  # Set budget alerts in each provider console
  ```

### Health Checks

- [ ] **Health endpoint working** - GET /health returns 200
  ```bash
  curl -I http://yourdomain.com/health
  # Should return 200
  ```

- [ ] **Database health monitored** - Connection status
  ```bash
  curl http://yourdomain.com/api/db-test
  # Should return success
  ```

- [ ] **Dependency health checked** - API providers accessible
  ```bash
  # Should be able to call Anthropic API
  # Should be able to call OpenAI API
  # Check provider status pages if not working
  ```

---

## 📋 Documentation Checklist

### Developer Documentation

- [ ] **README.md up to date** - Reflects current state
  ```bash
  # Read through README
  # Verify commands still work
  ```

- [ ] **API Documentation current** - All endpoints documented
  ```bash
  # Check API_DOCUMENTATION.md
  # Verify all 27 endpoints listed
  ```

- [ ] **Deployment docs complete** - Others can deploy
  ```bash
  # Read DEPLOYMENT_GUIDE.md
  # Could someone new deploy from this?
  ```

### Operational Documentation

- [ ] **Runbook created** - How to operate in production
  ```bash
  # Documented:
  # - How to deploy
  # - How to rollback
  # - Common troubleshooting
  ```

- [ ] **Incident response plan** - What to do if down
  ```bash
  # Documented:
  # - Who to contact
  # - How to debug
  # - How to restore
  ```

- [ ] **Architecture documented** - System design clear
  ```bash
  # Have diagram or written description of:
  # - Services and their relationships
  # - Data flow
  # - External dependencies
  ```

---

## 🚨 Disaster Recovery Checklist

### Backups

- [ ] **Database backups automated** - Daily minimum
  ```bash
  # Verify backup job runs
  # Check backup file sizes are reasonable
  # Test restore from backup
  ```

- [ ] **Code backups available** - Can restore from git
  ```bash
  # All code in git repository
  # Repository has backups (GitHub)
  # Can clone and deploy anytime
  ```

- [ ] **Configuration backed up** - Environment variables saved
  ```bash
  # Documented somewhere safe:
  # - Where .env variables are stored
  # - How to restore them
  # - Who has access
  ```

### Recovery

- [ ] **Database restore tested** - Know it works
  ```bash
  # Practice restoring from backup
  # Time how long it takes
  # Verify data integrity after restore
  ```

- [ ] **Deployment can be redone** - From scratch if needed
  ```bash
  # Test:
  # 1. Fresh server
  # 2. Clone repo
  # 3. Set environment variables
  # 4. Deploy
  # 5. Verify it works
  ```

- [ ] **Rollback documented** - Quick way to revert
  ```bash
  # Documented:
  # - How to rollback to previous version
  # - How long it takes
  # - What to check after rollback
  ```

---

## ✨ Final Checklist

### Before Go-Live

- [ ] **Owner assigned** - Someone responsible for production
- [ ] **Contact info updated** - Who to call if problems
- [ ] **Support plan ready** - How to handle issues
- [ ] **Schedule communicated** - Tell users about launch
- [ ] **Team trained** - Everyone knows system
- [ ] **Monitoring set up** - Can detect problems
- [ ] **Backups tested** - Recovery proven to work
- [ ] **Rollback plan ready** - Know how to revert

### Day 1 (Launch Day)

- [ ] **Monitor closely** - Watch for problems
- [ ] **Logs checked regularly** - Error rate normal?
- [ ] **Performance acceptable** - Response times OK?
- [ ] **Users can access** - No login/connectivity issues
- [ ] **Team on standby** - Ready to fix problems
- [ ] **Status page updated** - Let users know it's live

### Day 30 (First Month)

- [ ] **No critical issues** - System stable
- [ ] **Performance baseline established** - Know what's normal
- [ ] **Cost tracking verified** - AI provider costs reasonable
- [ ] **Usage patterns understood** - Who's using what
- [ ] **Improvements identified** - What can be better

---

## 🎯 Scoring Your Readiness

Count checked boxes:

- **🟢 Ready** - 90%+ boxes checked
- **🟡 Proceed with caution** - 70-89% boxes checked
- **🔴 Not ready** - < 70% boxes checked

**Recommendation**: Don't deploy if < 80% complete.

---

## 📞 Sign-Off

**I verify this deployment meets production standards:**

- [ ] Security reviewed _________________ (signature)
- [ ] Performance tested ________________ (signature)
- [ ] Backups tested ___________________ (signature)
- [ ] Team trained ____________________ (signature)
- [ ] Ready to launch __________________ (signature)

**Deployment Date**: _______________
**Deployed By**: _______________
**Contact**: _______________

---

**Your system is now production-ready!** 🚀

Monitor it closely in the first week. Most problems surface quickly.

If issues found, refer to [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or rollback using your documented procedure.
