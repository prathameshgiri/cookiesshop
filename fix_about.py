import re

# Read the file
with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_about = '''<section class="about-section" id="about">
  <div class="container">

    <!-- Section Header -->
    <div class="about-story-header reveal">
      <div class="section-badge">&#129505; Our Story</div>
      <h2 class="section-title" style="color:#FDFAF5;">Made with <span style="background:linear-gradient(135deg,#F0B845,#E07820);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Passion &amp; Love</span></h2>
      <p class="section-subtitle" style="color:rgba(253,250,245,0.6);">From a home kitchen to your doorstep &mdash; here&rsquo;s how Good Cookie was born</p>
    </div>

    <!-- Two-column: Image | Content -->
    <div class="about-grid">

      <!-- Left: Image -->
      <div class="about-image reveal">
        <div class="about-img-wrap">
          <img src="/images/cookies.png" alt="Our Story" />
          <div class="about-badge-float">
            <span>&#127942;</span>
            <div>
              <strong>Award Winning</strong>
              <small>Best Bakery 2025</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Story + Timeline + Stats -->
      <div class="about-content reveal">
        <p class="about-text">
          Good Cookie was born from a simple dream &mdash; to bring the joy of freshly baked, handcrafted chocolates and cookies to every doorstep. What started as a home kitchen experiment became a beloved brand.
        </p>

        <!-- Timeline -->
        <div class="about-timeline">
          <div class="tl-item">
            <div class="tl-year">2020</div>
            <div class="tl-title">The Beginning</div>
            <div class="tl-desc">Started baking from home with just 3 recipes and a whole lot of love.</div>
          </div>
          <div class="tl-item">
            <div class="tl-year">2022</div>
            <div class="tl-title">First Store Opened</div>
            <div class="tl-desc">Moved to a dedicated kitchen, launched our first 20 signature products.</div>
          </div>
          <div class="tl-item">
            <div class="tl-year">2024</div>
            <div class="tl-title">Best Bakery Award</div>
            <div class="tl-desc">Recognized as Maharashtra&rsquo;s Best Artisan Bakery at the Food Excellence Awards.</div>
          </div>
          <div class="tl-item">
            <div class="tl-year">2025</div>
            <div class="tl-title">Nationwide Delivery</div>
            <div class="tl-desc">Now delivering premium chocolates &amp; cookies across all major Indian cities.</div>
          </div>
        </div>

        <!-- Stat strip -->
        <div class="about-stats-strip">
          <div class="as-stat"><span class="as-num">500+</span><span class="as-label">Happy Customers</span></div>
          <div class="as-stat"><span class="as-num">30+</span><span class="as-label">Unique Flavors</span></div>
          <div class="as-stat"><span class="as-num">4.9&#9733;</span><span class="as-label">Avg Rating</span></div>
        </div>

        <a href="#products" class="btn btn-primary">Explore Products &rarr;</a>
      </div>

    </div>
  </div>
</section>'''

# Find and replace the about section
start_marker = '<section class="about-section" id="about">'
# Find 2nd </section> after start (the one closing about-section)
start_idx = content.find(start_marker)
# find closing </section>
end_idx = content.find('</section>', start_idx) + len('</section>')

if start_idx == -1:
    print('ERROR: about-section not found!')
else:
    new_content = content[:start_idx] + new_about + content[end_idx:]
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('SUCCESS: About section replaced!')
    print(f'Replaced chars {start_idx} to {end_idx}')
