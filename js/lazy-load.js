(function(){
  const splineSection = document.querySelector('.spline-footer.hero');
  if (!splineSection) return;

  const viewer = splineSection.querySelector('spline-viewer');
  const spinner = splineSection.querySelector('.spline-loader');
  const splineSrc = splineSection.dataset.splineSrc;
  const splitTypeSrc = splineSection.dataset.splitTypeSrc;
  const viewerUrl = viewer ? viewer.dataset.url : null;

  if (!viewer || !splineSrc || !viewerUrl) return;

  let hasLoadedAssets = false;

  function loadScript({ src, type = 'text/javascript' }) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.querySelectorAll('script')).find(script => script.src === src);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
        } else {
          existing.addEventListener('load', () => {
            existing.dataset.loaded = 'true';
            resolve();
          }, { once: true });
          existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
        }
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.type = type;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  function ensureSplitType() {
    if (typeof SplitType !== 'undefined' || !splitTypeSrc) {
      return Promise.resolve();
    }
    return loadScript({ src: splitTypeSrc });
  }

  function ensureSplineViewer() {
    if (typeof customElements !== 'undefined' && customElements.get('spline-viewer')) {
      return Promise.resolve();
    }
    return loadScript({ src: splineSrc, type: 'module' });
  }

  function onLoadComplete() {
    splineSection.classList.remove('is-loading');
    if (spinner) {
      spinner.style.pointerEvents = 'none';
    }
  }

  function waitForViewerReady() {
    if (!viewer) return Promise.resolve();

    return new Promise(resolve => {
      let resolved = false;

      const cleanup = () => {
        resolved = true;
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('error', handleError);
      };

      const handleLoad = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        resolve();
      };

      // In case the component is already initialised
      try {
        if (viewer.shadowRoot && viewer.shadowRoot.querySelector('canvas')) {
          cleanup();
          resolve();
          return;
        }
      } catch (err) {
        // Accessing shadowRoot might throw if not initialised yet
      }

      viewer.addEventListener('load', handleLoad, { once: true });
      viewer.addEventListener('error', handleError, { once: true });

      // Safety timeout in case load never fires
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          resolve();
        }
      }, 5000);
    });
  }

  function initialiseSpline() {
    if (hasLoadedAssets) return;
    hasLoadedAssets = true;
    splineSection.classList.add('is-loading');

    Promise.allSettled([ensureSplitType(), ensureSplineViewer()]).then(results => {
      const splineReady = typeof customElements !== 'undefined' && customElements.get('spline-viewer');
      const viewerLoadOk = results[1] && results[1].status === 'fulfilled';

      if (!splineReady && !viewerLoadOk) {
        console.error('Spline viewer failed to load. Will retry on next intersection.');
        hasLoadedAssets = false;
        return;
      }

      const viewerReadyPromise = waitForViewerReady();

      if (!viewer.getAttribute('url')) {
        viewer.setAttribute('url', viewerUrl);
      }

      viewerReadyPromise.then(() => {
        if (typeof window.initSplineHero === 'function') {
          requestAnimationFrame(() => window.initSplineHero(onLoadComplete));
        } else {
          onLoadComplete();
        }
      });
    });
  }

  const observerOptions = { rootMargin: '200px 0px' };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initialiseSpline();
          observer.disconnect();
        }
      });
    }, observerOptions);

    observer.observe(splineSection);
  } else {
    // Fallback for older browsers
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initialiseSpline);
    } else {
      window.addEventListener('load', initialiseSpline, { once: true });
    }
  }
})();
