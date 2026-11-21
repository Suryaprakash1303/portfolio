document.documentElement.classList.add('js');

(function () {
  // Let's Connect form validation & live email submission via FormSubmit
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var subjectInput = document.getElementById('contact-subject');
    var messageInput = document.getElementById('contact-message');
    var submitBtn = document.getElementById('contact-submit-btn');
    var submitText = submitBtn ? submitBtn.querySelector('.connect-submit-text') : null;
    var feedbackEl = document.getElementById('form-feedback');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setFieldError(input, errorId, message) {
      var errEl = document.getElementById(errorId);
      if (message) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        if (errEl) errEl.textContent = message;
      } else {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        if (errEl) errEl.textContent = '';
      }
    }

    function showFeedback(type, message, includeDirectEmail) {
      if (!feedbackEl) return;
      feedbackEl.className = 'form-feedback form-feedback--' + type;
      feedbackEl.textContent = message;
      if (includeDirectEmail) {
        feedbackEl.appendChild(document.createTextNode(' '));
        var mailLink = document.createElement('a');
        mailLink.href = 'mailto:suryaprakashrv2005@gmail.com';
        mailLink.textContent = 'suryaprakashrv2005@gmail.com';
        feedbackEl.appendChild(mailLink);
      }
      feedbackEl.hidden = false;
    }

    function hideFeedback() {
      if (feedbackEl) {
        feedbackEl.hidden = true;
        feedbackEl.textContent = '';
      }
    }

    function validateForm() {
      var isValid = true;
      var firstInvalid = null;

      var nameVal = nameInput.value.trim();
      if (nameVal.length < 2) {
        setFieldError(nameInput, 'error-name', 'Please enter your full name (at least 2 characters).');
        isValid = false;
        firstInvalid = firstInvalid || nameInput;
      } else {
        setFieldError(nameInput, 'error-name', '');
      }

      var emailVal = emailInput.value.trim();
      if (!emailPattern.test(emailVal)) {
        setFieldError(emailInput, 'error-email', 'Please enter a valid email address.');
        isValid = false;
        firstInvalid = firstInvalid || emailInput;
      } else {
        setFieldError(emailInput, 'error-email', '');
      }

      var subjectVal = subjectInput.value.trim();
      if (!subjectVal) {
        setFieldError(subjectInput, 'error-subject', 'Please select a subject for your message.');
        isValid = false;
        firstInvalid = firstInvalid || subjectInput;
      } else {
        setFieldError(subjectInput, 'error-subject', '');
      }

      var messageVal = messageInput.value.trim();
      if (messageVal.length < 10) {
        setFieldError(messageInput, 'error-message', 'Please enter a message of at least 10 characters.');
        isValid = false;
        firstInvalid = firstInvalid || messageInput;
      } else {
        setFieldError(messageInput, 'error-message', '');
      }

      if (firstInvalid) {
        firstInvalid.focus();
      }
      return isValid;
    }

    [
      [nameInput, 'error-name'],
      [emailInput, 'error-email'],
      [subjectInput, 'error-subject'],
      [messageInput, 'error-message']
    ].forEach(function (pair) {
      if (!pair[0]) return;
      var ev = pair[0].tagName === 'SELECT' ? 'change' : 'input';
      pair[0].addEventListener(ev, function () {
        if (pair[0].classList.contains('is-invalid')) {
          setFieldError(pair[0], pair[1], '');
        }
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideFeedback();

      if (!validateForm()) return;

      var honey = contactForm.querySelector('input[name="_honey"]');
      if (honey && honey.value) return;

      if (window.location.protocol === 'file:') {
        showFeedback(
          'error',
          'Email delivery requires running the site over HTTP/HTTPS (such as localhost or a live domain). You can also email me directly at',
          true
        );
        return;
      }

      var endpoint = contactForm.getAttribute('action');
      var formData = new FormData();
      formData.append('name', nameInput.value.trim());
      formData.append('email', emailInput.value.trim());
      formData.append('subject', subjectInput.value.trim());
      formData.append('message', messageInput.value.trim());
      formData.append('_subject', '[Portfolio] ' + subjectInput.value.trim() + ' — from ' + nameInput.value.trim());
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      if (submitText) submitText.textContent = 'Sending…';

      fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: formData
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: res.ok, status: res.status, data: data };
            });
        })
        .then(function (result) {
          var delivered =
            result.ok && (result.data.success === true || result.data.success === 'true');
          if (delivered) {
            var serverMsg =
              typeof result.data.message === 'string' && /confirm|activat/i.test(result.data.message)
                ? result.data.message
                : 'Thank you! Your message has been sent successfully. I will get back to you soon.';
            showFeedback('success', serverMsg, false);
            contactForm.reset();
          } else {
            var errMsg =
              (result.data && result.data.message) ||
              'Message could not be delivered right now. Please try again or email me directly at';
            showFeedback('error', errMsg, !(result.data && result.data.message));
          }
        })
        .catch(function () {
          showFeedback(
            'error',
            'Unable to reach the email service right now. Please check your connection or email me directly at',
            true
          );
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
          if (submitText) submitText.textContent = 'Send Message';
        });
    });
  }

  var els = document.querySelectorAll(
    '.hero, .stats, .skill, .section-title, .project, .exp-title, .exp, .sec-h, .tool-card, .insight-card, .connect-info, .connect-form-card, .list a'
  );

  els.forEach(function (el) {
    el.classList.add('reveal');
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
  });

  function show(el) {
    el.classList.add('in');
    setTimeout(function () {
      el.style.transitionDelay = '';
    }, 1000);
  }

  if (!('IntersectionObserver' in window)) {
    els.forEach(show);
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  // Reusable skill specialization modal binder
  var activeModalClose = null;

  function bindModal(triggerId, modalId) {
    var trigger = document.getElementById(triggerId);
    var modal = document.getElementById(modalId);
    if (!trigger || !modal) return;

    var dialog = modal.querySelector('.modal-dialog');
    var closeBtns = modal.querySelectorAll('[data-modal-close]');
    var scrollBtns = modal.querySelectorAll('[data-modal-scroll]');

    function openModal() {
      if (activeModalClose) {
        activeModalClose(false);
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      activeModalClose = closeModal;
      if (dialog) {
        dialog.focus({ preventScroll: true });
      }
    }

    function closeModal(restoreFocus) {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (activeModalClose === closeModal) {
        activeModalClose = null;
      }
      if (restoreFocus !== false) {
        trigger.focus({ preventScroll: true });
      }
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === ' ') {
        e.preventDefault();
        openModal();
      }
    });

    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeModal(true);
      });
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal(true);
      }
    });

    scrollBtns.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var selector = link.getAttribute('data-modal-scroll');
        var target = selector ? document.querySelector(selector) : null;
        if (target) {
          e.preventDefault();
          closeModal(false);
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeModalClose) {
      activeModalClose(true);
    }
  });

  bindModal('da-skill-card', 'da-modal');
  bindModal('tech-skill-card', 'tech-modal');

  // GitHub README.md modal for project cards
  var readmeModal = document.getElementById('readme-modal');
  var readmeTriggers = document.querySelectorAll('[data-readme-repo]');
  if (readmeModal && readmeTriggers.length) {
    var readmeDialog = readmeModal.querySelector('.modal-dialog');
    var readmeTitleEl = document.getElementById('readme-modal-title');
    var readmeBodyEl = document.getElementById('readme-modal-body');
    var readmeLoadingEl = document.getElementById('readme-loading');
    var readmeErrorEl = document.getElementById('readme-error');
    var readmeErrorMsgEl = document.getElementById('readme-error-msg');
    var readmeErrorGitHubEl = document.getElementById('readme-error-github');
    var readmeContentEl = document.getElementById('readme-content');
    var readmeGitHubLink = document.getElementById('readme-github-link');
    var readmeRetryBtn = document.getElementById('readme-retry-btn');
    var readmeCloseBtns = readmeModal.querySelectorAll('[data-modal-close]');
    var readmeCache = {};
    var currentRepoConfig = null;
    var lastReadmeTrigger = null;

    function decodeBase64Utf8(b64) {
      var bin = atob(b64.replace(/\s/g, ''));
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function fallbackMarkdownToHtml(md) {
      var codeBlocks = [];
      var text = md.replace(/```([\w-]*)\n([\s\S]*?)```/g, function (_, lang, code) {
        var idx = codeBlocks.length;
        codeBlocks.push('<pre><code>' + escapeHtml(code.replace(/\n$/, '')) + '</code></pre>');
        return '\n@@CODEBLOCK_' + idx + '@@\n';
      });

      var lines = text.split(/\r?\n/);
      var out = [];
      var inList = false;

      function inlineFormat(s) {
        return escapeHtml(s)
          .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      }

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var codeMatch = line.match(/^@@CODEBLOCK_(\d+)@@$/);
        if (codeMatch) {
          if (inList) {
            out.push('</ul>');
            inList = false;
          }
          out.push(codeBlocks[Number(codeMatch[1])]);
          continue;
        }
        var hMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (hMatch) {
          if (inList) {
            out.push('</ul>');
            inList = false;
          }
          var lvl = hMatch[1].length;
          out.push('<h' + lvl + '>' + inlineFormat(hMatch[2]) + '</h' + lvl + '>');
          continue;
        }
        var liMatch = line.match(/^\s*[-*+]\s+(.+)$/);
        if (liMatch) {
          if (!inList) {
            out.push('<ul>');
            inList = true;
          }
          out.push('<li>' + inlineFormat(liMatch[1]) + '</li>');
          continue;
        }
        if (inList) {
          out.push('</ul>');
          inList = false;
        }
        if (/^\s*---+\s*$/.test(line)) {
          out.push('<hr>');
        } else if (line.trim() !== '') {
          out.push('<p>' + inlineFormat(line) + '</p>');
        }
      }
      if (inList) out.push('</ul>');
      return out.join('\n');
    }

    function resolveRelativeUrl(url, baseUrl) {
      if (!url || /^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(url)) {
        return url;
      }
      var clean = url.replace(/^\.?\//, '');
      return baseUrl + clean;
    }

    function renderReadme(markdown, branch, owner, repo) {
      var rawBase = 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + branch + '/';
      var blobBase = 'https://github.com/' + owner + '/' + repo + '/blob/' + branch + '/';
      var html;

      if (window.marked && typeof window.marked.parse === 'function') {
        html = window.marked.parse(markdown, { gfm: true, breaks: false });
      } else {
        html = fallbackMarkdownToHtml(markdown);
      }

      if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
        html = window.DOMPurify.sanitize(html, {
          ADD_TAGS: ['details', 'summary'],
          ADD_ATTR: ['target', 'rel', 'align', 'width', 'height']
        });
      }

      readmeContentEl.innerHTML = html;

      readmeContentEl.querySelectorAll('img').forEach(function (img) {
        var src = img.getAttribute('src');
        if (!src) return;
        var resolved = resolveRelativeUrl(src, rawBase);
        resolved = resolved.replace(
          /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
          'https://raw.githubusercontent.com/$1/$2/$3/$4'
        );
        img.setAttribute('src', resolved);
        img.setAttribute('loading', 'lazy');
      });

      readmeContentEl.querySelectorAll('a').forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#') return;
        a.setAttribute('href', resolveRelativeUrl(href, blobBase));
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });

      readmeContentEl.querySelectorAll('table').forEach(function (table) {
        if (table.parentNode && table.parentNode.classList && table.parentNode.classList.contains('md-table-wrap')) {
          return;
        }
        var wrap = document.createElement('div');
        wrap.className = 'md-table-wrap';
        table.parentNode.insertBefore(wrap, table);
        wrap.appendChild(table);
      });
    }

    function fetchGithubReadme(owner, repo) {
      var branches = ['main', 'master'];
      var files = ['README.md', 'readme.md'];
      var candidates = [];

      branches.forEach(function (branch) {
        files.forEach(function (file) {
          candidates.push({
            branch: branch,
            url: 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + branch + '/' + file
          });
        });
      });

      function tryCandidate(index) {
        if (index >= candidates.length) {
          return fetch('https://api.github.com/repos/' + owner + '/' + repo + '/readme', {
            headers: { Accept: 'application/vnd.github+json' }
          }).then(function (res) {
            if (!res.ok) {
              throw new Error('GitHub responded with status ' + res.status);
            }
            return res.json().then(function (data) {
              var branch = 'main';
              if (data.download_url) {
                var m = data.download_url.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/([^/]+)\//);
                if (m) branch = m[1];
              }
              return {
                markdown: decodeBase64Utf8(data.content || ''),
                branch: branch
              };
            });
          });
        }

        var item = candidates[index];
        return fetch(item.url)
          .then(function (res) {
            if (res.ok) {
              return res.text().then(function (text) {
                return { markdown: text, branch: item.branch };
              });
            }
            return tryCandidate(index + 1);
          })
          .catch(function () {
            return tryCandidate(index + 1);
          });
      }

      return tryCandidate(0);
    }

    function showReadmeState(state) {
      readmeLoadingEl.hidden = state !== 'loading';
      readmeErrorEl.hidden = state !== 'error';
      readmeContentEl.hidden = state !== 'content';
    }

    function loadReadmeFor(config, forceRefresh) {
      var cacheKey = config.owner + '/' + config.repo;
      readmeTitleEl.textContent = config.title;
      readmeGitHubLink.href = config.url;
      if (readmeErrorGitHubEl) {
        readmeErrorGitHubEl.href = config.url;
      }
      if (readmeBodyEl) {
        readmeBodyEl.scrollTop = 0;
      }

      if (!forceRefresh && readmeCache[cacheKey]) {
        var cached = readmeCache[cacheKey];
        renderReadme(cached.markdown, cached.branch, config.owner, config.repo);
        showReadmeState('content');
        return;
      }

      showReadmeState('loading');
      fetchGithubReadme(config.owner, config.repo)
        .then(function (result) {
          readmeCache[cacheKey] = result;
          if (currentRepoConfig && currentRepoConfig.owner + '/' + currentRepoConfig.repo === cacheKey) {
            renderReadme(result.markdown, result.branch, config.owner, config.repo);
            showReadmeState('content');
          }
        })
        .catch(function () {
          if (currentRepoConfig && currentRepoConfig.owner + '/' + currentRepoConfig.repo === cacheKey) {
            if (readmeErrorMsgEl) {
              readmeErrorMsgEl.textContent =
                'Could not fetch README.md from GitHub right now. Please check your internet connection or open the repository directly.';
            }
            showReadmeState('error');
          }
        });
    }

    function closeReadmeModal(restoreFocus) {
      if (!readmeModal.classList.contains('is-open')) return;
      readmeModal.classList.remove('is-open');
      readmeModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (activeModalClose === closeReadmeModal) {
        activeModalClose = null;
      }
      if (restoreFocus !== false && lastReadmeTrigger) {
        lastReadmeTrigger.focus({ preventScroll: true });
      }
    }

    function openReadmeModal(triggerEl) {
      if (activeModalClose) {
        activeModalClose(false);
      }
      lastReadmeTrigger = triggerEl;
      currentRepoConfig = {
        owner: triggerEl.getAttribute('data-readme-owner'),
        repo: triggerEl.getAttribute('data-readme-repo'),
        title: triggerEl.getAttribute('data-readme-title') || 'Project Documentation',
        url: triggerEl.getAttribute('data-readme-url') || '#'
      };

      readmeModal.classList.add('is-open');
      readmeModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      activeModalClose = closeReadmeModal;

      if (readmeDialog) {
        readmeDialog.focus({ preventScroll: true });
      }
      loadReadmeFor(currentRepoConfig, false);
    }

    readmeTriggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openReadmeModal(btn);
      });
    });

    readmeCloseBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeReadmeModal(true);
      });
    });

    readmeModal.addEventListener('click', function (e) {
      if (e.target === readmeModal) {
        closeReadmeModal(true);
      }
    });

    if (readmeRetryBtn) {
      readmeRetryBtn.addEventListener('click', function () {
        if (currentRepoConfig) {
          loadReadmeFor(currentRepoConfig, true);
        }
      });
    }
  }

  // Data Analytics Insights expandable article reader modal
  var articleModal = document.getElementById('article-modal');
  var articleTriggers = document.querySelectorAll('[data-article-id]');
  if (articleModal && articleTriggers.length) {
    var articleDialog = articleModal.querySelector('.modal-dialog');
    var articleTitleEl = document.getElementById('article-modal-title');
    var articleMetaEl = document.getElementById('article-modal-meta');
    var articleBodyEl = document.getElementById('article-modal-body');
    var articleContentEl = document.getElementById('article-modal-content');
    var articlePrevBtn = document.getElementById('article-prev-btn');
    var articleNextBtn = document.getElementById('article-next-btn');
    var articleCloseBtns = articleModal.querySelectorAll('[data-modal-close]');
    var lastArticleTrigger = null;
    var currentArticleIndex = 0;

    var articles = [
      {
        id: 'power-of-data-analytics',
        title: 'The Power of Data Analytics',
        date: '18 Nov 2026',
        readTime: '5 min read',
        html:
          '<p class="article-lead">Every click, transaction, sensor reading, and operational log generates raw information. On its own, raw data is noise—data analytics turns it into clarity, direction, and confident decision-making.</p>' +
          '<h3>From Raw Records to Clear Understanding</h3>' +
          '<p>Modern organizations collect vast volumes of structured and unstructured data every day. Without a systematic analytical process, critical signals—such as shifting customer demand, rising operational bottlenecks, or underperforming channels—remain hidden inside spreadsheets and databases.</p>' +
          '<h3>The Four Pillars of Analytical Value</h3>' +
          '<ul>' +
          '<li><strong>Descriptive Analytics:</strong> Summarizes what happened using clean metrics, KPIs, and historical comparisons.</li>' +
          '<li><strong>Diagnostic Analytics:</strong> Digs deeper into trends, segments, and correlations to explain <em>why</em> performance changed.</li>' +
          '<li><strong>Predictive Analytics:</strong> Uses historical patterns and statistical models to anticipate likely future outcomes.</li>' +
          '<li><strong>Prescriptive Analytics:</strong> Connects findings to concrete actions that improve efficiency and outcomes.</li>' +
          '</ul>' +
          '<h3>Why Data-Driven Decisions Outperform Guesswork</h3>' +
          '<p>Decisions guided by verified evidence reduce costly trial-and-error. By aligning stakeholders around transparent metrics and visual reports, teams can test hypotheses objectively, measure impact quickly, and allocate time and budget where they matter most.</p>' +
          '<blockquote>Good analytics is not just about producing charts—it is about answering the right business question clearly enough that someone can act on it.</blockquote>'
      },
      {
        id: 'why-sql-is-essential',
        title: 'Why SQL Is Essential for Data Analysts',
        date: '18 Nov 2026',
        readTime: '6 min read',
        html:
          '<p class="article-lead">Before any chart is built or model is trained, the right data has to be retrieved accurately. SQL (Structured Query Language) remains the universal bridge between relational databases and actionable analysis.</p>' +
          '<h3>Querying &amp; Filtering at the Source</h3>' +
          '<p>Real-world datasets frequently live across millions of rows in relational databases like MySQL or PostgreSQL. Rather than exporting massive raw tables into spreadsheets, SQL lets analysts filter records with <code>WHERE</code>, select only relevant columns, and slice exact date ranges directly inside the database engine.</p>' +
          '<h3>Connecting Context with Joins</h3>' +
          '<p>Business data is rarely stored in one table. Orders live in one table, customers in another, and product catalogs in a third. Using <code>INNER JOIN</code>, <code>LEFT JOIN</code>, and multi-table relationships, analysts combine scattered records into a unified view without duplicating effort.</p>' +
          '<h3>Summarizing Patterns with Aggregations</h3>' +
          '<p>Functions like <code>SUM()</code>, <code>COUNT()</code>, <code>AVG()</code>, <code>GROUP BY</code>, and <code>HAVING</code> turn granular transactions into clean business metrics:</p>' +
          '<pre><code>SELECT\n  c.region,\n  COUNT(DISTINCT o.order_id) AS total_orders,\n  ROUND(SUM(o.amount), 2) AS total_revenue\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.customer_id\nWHERE o.order_date &gt;= \'2026-01-01\'\nGROUP BY c.region\nHAVING SUM(o.amount) &gt; 10000\nORDER BY total_revenue DESC;</code></pre>' +
          '<h3>Key Takeaway</h3>' +
          '<p>Mastering SQL empowers analysts to validate data quality early, reproduce analyses reliably, and answer ad-hoc stakeholder questions in minutes rather than hours.</p>'
      },
      {
        id: 'turning-raw-data-into-insights',
        title: 'Turning Raw Data into Meaningful Insights',
        date: '18 Nov 2026',
        readTime: '5 min read',
        html:
          '<p class="article-lead">Raw datasets are rarely ready for presentation. Missing values, inconsistent date formats, duplicate entries, and ungrouped logs all stand between a raw CSV and a decision-ready dashboard.</p>' +
          '<h3>Step 1: Cleaning &amp; Structuring with Python and Pandas</h3>' +
          '<p>Python paired with Pandas makes repetitive data preparation repeatable and transparent. Analysts can inspect schema types, handle nulls thoughtfully, standardize categories, and create derived metrics in a few readable lines:</p>' +
          '<pre><code>import pandas as pd\n\ndf = pd.read_csv("sales_raw.csv")\ndf = df.drop_duplicates()\ndf["order_date"] = pd.to_datetime(df["order_date"])\ndf["revenue"] = df["quantity"] * df["unit_price"]\nmonthly_summary = df.groupby(df["order_date"].dt.to_period("M"))["revenue"].sum()</code></pre>' +
          '<h3>Step 2: Exploring Patterns &amp; Validating Assumptions</h3>' +
          '<p>Once the data is clean, Exploratory Data Analysis (EDA) reveals distributions, outliers, seasonal spikes, and category performance. Visualizing intermediate checks helps catch anomalies early before metrics reach decision-makers.</p>' +
          '<h3>Step 3: Communicating Clearly with Power BI</h3>' +
          '<p>Clean data delivers its highest value when stakeholders can explore it intuitively. In Power BI, structured tables become interactive KPI cards, trend visuals, and filterable views that highlight what changed, where to look next, and which actions matter most.</p>' +
          '<blockquote>Clean data builds trust, thoughtful analysis uncovers the story, and clear visualization turns insight into action.</blockquote>'
      }
    ];

    function renderArticle(index) {
      var art = articles[index];
      if (!art) return;
      currentArticleIndex = index;
      articleTitleEl.textContent = art.title;
      articleMetaEl.textContent = 'Data Analytics Insights · ' + art.date + ' · ' + art.readTime;
      articleContentEl.innerHTML = art.html;
      if (articleBodyEl) {
        articleBodyEl.scrollTop = 0;
      }
      if (articlePrevBtn) {
        articlePrevBtn.disabled = index === 0;
        articlePrevBtn.style.opacity = index === 0 ? '0.45' : '';
        articlePrevBtn.style.cursor = index === 0 ? 'not-allowed' : '';
      }
      if (articleNextBtn) {
        var isLast = index === articles.length - 1;
        articleNextBtn.disabled = isLast;
        articleNextBtn.style.opacity = isLast ? '0.45' : '';
        articleNextBtn.style.cursor = isLast ? 'not-allowed' : '';
      }
    }

    function closeArticleModal(restoreFocus) {
      if (!articleModal.classList.contains('is-open')) return;
      articleModal.classList.remove('is-open');
      articleModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (activeModalClose === closeArticleModal) {
        activeModalClose = null;
      }
      if (restoreFocus !== false && lastArticleTrigger) {
        lastArticleTrigger.focus({ preventScroll: true });
      }
    }

    function openArticleModal(articleId, triggerEl) {
      var idx = articles.findIndex(function (a) {
        return a.id === articleId;
      });
      if (idx === -1) idx = 0;
      if (activeModalClose) {
        activeModalClose(false);
      }
      lastArticleTrigger = triggerEl;
      renderArticle(idx);
      articleModal.classList.add('is-open');
      articleModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      activeModalClose = closeArticleModal;
      if (articleDialog) {
        articleDialog.focus({ preventScroll: true });
      }
    }

    articleTriggers.forEach(function (card) {
      card.addEventListener('click', function () {
        openArticleModal(card.getAttribute('data-article-id'), card);
      });
    });

    articleCloseBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeArticleModal(true);
      });
    });

    articleModal.addEventListener('click', function (e) {
      if (e.target === articleModal) {
        closeArticleModal(true);
      }
    });

    if (articlePrevBtn) {
      articlePrevBtn.addEventListener('click', function () {
        if (currentArticleIndex > 0) {
          renderArticle(currentArticleIndex - 1);
        }
      });
    }

    if (articleNextBtn) {
      articleNextBtn.addEventListener('click', function () {
        if (currentArticleIndex < articles.length - 1) {
          renderArticle(currentArticleIndex + 1);
        }
      });
    }
  }

  // Footer Back to Top smooth scroll
  var backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
