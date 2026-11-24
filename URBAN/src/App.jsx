import { useMemo, useState } from 'react'
import './App.css'

const teaProducts = [
  { name: 'Sencha', category: 'tea', price: 9.99, image: { file: 'crops/tea-sencha.png' } },
  { name: 'Gyokuro', category: 'tea', price: 8.99, image: { file: 'crops/tea-gyokuro.png' } },
  { name: 'Green tea', category: 'tea', price: 7.99, image: { file: 'crops/tea-green.png' } },
  { name: 'Tezumi', category: 'tea', price: 9.99, image: { file: 'crops/tea-tezumi.png' } },
  { name: 'Kabusecha', category: 'tea', price: 9.99, image: { file: 'crops/tea-kabusecha.png' } },
  { name: 'Futomaki', category: 'tea', price: 14.99, image: { file: 'crops/tea-futomaki.png' } },
]

const sushiProducts = [
  { name: 'Inumaki', category: 'sushi', price: 9.99, image: { file: 'crops/sushi-inumaki.png' } },
  { name: 'Hosomaki', category: 'sushi', price: 9.99, image: { file: 'crops/sushi-hosomaki.png' } },
  { name: 'Futomaki', category: 'sushi', price: 14.99, image: { file: 'crops/sushi-futomaki.png' } },
  { name: 'Oshizushi', category: 'sushi', price: 25.99, image: { file: 'crops/sushi-oshizushi.png' } },
  { name: 'Sushi Boat', category: 'sushi', price: 29.99, image: { file: 'crops/sushi-boat.png' } },
  { name: 'Chirashi', category: 'sushi', price: 19.99, image: { file: 'crops/sushi-chirashi.png' } },
]

const allProducts = [...teaProducts, ...sushiProducts]

async function postApi(path, body) {
  let response
  try {
    response = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the API. Make sure the Express server is running.')
  }

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The API returned an unexpected response. Check that the Express server is running.')
  }

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'The request could not be completed.')
  }

  return result
}

function Icon({ name, size = 28 }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    cart: <><path d="M3 4h2l2.4 11.3a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H6" /><circle cx="10" cy="21" r="1.5" /><circle cx="18" cy="21" r="1.5" /></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /><path d="m4 20 16-16" /></>,
    back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h12" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...common}>
      {paths[name]}
    </svg>
  )
}

function ProductImage({ product, className = '' }) {
  return (
    <div
      className={`product-image ${className}`}
      role="img"
      aria-label={`${product.name} product`}
      style={{
        backgroundImage: `url("/assets/${product.image.file}")`,
        backgroundPosition: 'center',
      }}
    />
  )
}

function PasswordInput({ label, value, onChange, required = true, autoComplete, minLength }) {
  const [visible, setVisible] = useState(false)

  return (
    <label className="auth-field">
      <span>{label}</span>
      <span className="password-wrap">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
        />
        <button
          className="eye-button"
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          <Icon name="eye" size={23} />
        </button>
      </span>
    </label>
  )
}

function AuthPage({ mode, onLogin, onCreateAccount, onNavigate }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pin, setPin] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submitLogin(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onLogin({ identifier: username.trim(), password })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to log in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitSignup(event) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    setIsSubmitting(true)
    try {
      await onCreateAccount({ username: username.trim(), email: email.trim(), password })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create the account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function sendPin() {
    setError('')
    setMessage('Password reset is not connected yet. Email verification must be configured first.')
  }

  function submitReset(event) {
    event.preventDefault()
    setError('')
    setError('Password reset is not available until email verification is configured.')
  }

  if (mode === 'login') {
    return (
      <main className="auth-page">
        <section className="auth-left">
          <div className="brand-heading">
            <p>Welcome to</p>
            <h1>Urban Roll</h1>
          </div>
          <form className="login-card" onSubmit={submitLogin}>
            <div className="brand-mark" aria-label="Urban Roll" />
            <label className="auth-field">
              <span>Username</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
            </label>
            <PasswordInput label="Password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
            <button type="button" className="forgot-link" onClick={() => onNavigate('forgot')}>Forgot password?</button>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="auth-actions">
              <button className="button button--wine" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </button>
              <button className="button button--gray" type="button" onClick={() => onNavigate('signup')}>Sign up</button>
            </div>
          </form>
        </section>
        <div className="auth-art" aria-hidden="true" />
      </main>
    )
  }

  const isSignup = mode === 'signup'
  return (
    <main className="auth-overlay-page">
      <div className="auth-reference-backdrop" aria-hidden="true" />
      <div className="auth-overlay-shade" aria-hidden="true" />
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <form className="dialog-form" onSubmit={isSignup ? submitSignup : submitReset}>
          <button type="button" className="dialog-back" aria-label="Back to login" onClick={() => onNavigate('login')}>
            <Icon name="back" size={24} />
          </button>
          <h1 id="dialog-title">Sign In</h1>
          {isSignup ? (
            <>
              <label className="auth-field">
                <span>Username :</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
              </label>
              <label className="auth-field">
                <span>Gmail/Email :</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </label>
              <PasswordInput label="Create Password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} />
              <PasswordInput label="Confirm Password:" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
            </>
          ) : (
            <>
              <label className="auth-field">
                <span>Username/Email :</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </label>
              <PasswordInput label="New Password:" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
              <label className="auth-field">
                <span>One Time Pin:</span>
                <input value={pin} onChange={(event) => setPin(event.target.value)} inputMode="numeric" autoComplete="one-time-code" />
              </label>
              <button type="button" className="send-otp" onClick={sendPin}>Send OTP</button>
              {message && <p className="form-message form-message--info" role="status">{message}</p>}
            </>
          )}
          {error && <p className="form-message form-message--error" role="alert">{error}</p>}
          <div className="dialog-actions">
            <button className="button button--wine" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isSignup ? 'Create' : 'Update'}
            </button>
            <button className="button button--gray" type="button" onClick={() => onNavigate('login')} disabled={isSubmitting}>Cancel</button>
          </div>
        </form>
        <div className={`dialog-art ${isSignup ? 'dialog-art--signup' : 'dialog-art--forgot'}`} aria-hidden="true" />
      </section>
    </main>
  )
}

function MenuHeader({ category, setCategory, search, setSearch, cartCount, onCart, onToggleNav }) {
  return (
    <header className="menu-header">
      <button className="header-logo" type="button" aria-label="Urban Roll home" onClick={() => setCategory('tea')}>
        <span className="brand-mark" />
      </button>
      <label className="search-box">
        <Icon name="search" size={29} />
        <input aria-label="Search menu" value={search} onChange={(event) => setSearch(event.target.value)} />
        {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}><Icon name="close" size={20} /></button>}
      </label>
      <nav className="category-nav" aria-label="Menu categories">
        <button className={category === 'tea' ? 'category-pill is-active' : 'category-pill'} type="button" onClick={() => setCategory('tea')}>TEA</button>
        <button className={category === 'sushi' ? 'category-pill is-active' : 'category-pill'} type="button" onClick={() => setCategory('sushi')}>Sushi</button>
      </nav>
      <button className="icon-button cart-button" type="button" aria-label={`Cart, ${cartCount} items`} onClick={onCart}>
        <Icon name="cart" size={57} />
        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </button>
      <button className="icon-button menu-button" type="button" aria-label="Open navigation menu" onClick={onToggleNav}>
        <Icon name="menu" size={51} />
      </button>
    </header>
  )
}

function ProductCard({ product, compact = false, showCategory = false, onSelect, onAdd }) {
  return (
    <article className={`product-card${compact ? ' product-card--compact' : ''}`}>
      <button className="product-card__open" type="button" onClick={() => onSelect(product)} aria-label={`View ${product.name}`}>
        <ProductImage product={product} />
        <span className="product-name">{product.name}</span>
        {showCategory && <span className="product-category">{product.category}</span>}
      </button>
      <div className="product-card__bottom">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <button className="add-button" type="button" onClick={() => onAdd(product)}>{compact ? 'add to cart' : 'Add'}</button>
      </div>
    </article>
  )
}

function HorizontalProductCard({ product, onSelect, onAdd }) {
  return (
    <article className="horizontal-product-card">
      <button className="horizontal-product-card__image" type="button" onClick={() => onSelect(product)} aria-label={`View ${product.name}`}>
        <ProductImage product={product} />
      </button>
      <div className="horizontal-product-card__details">
        <button type="button" className="horizontal-product-card__name" onClick={() => onSelect(product)}>{product.name}</button>
        <div className="product-card__bottom">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button className="add-button add-button--wide" type="button" onClick={() => onAdd(product)}>add to cart</button>
        </div>
      </div>
    </article>
  )
}

function MenuPage({ category, setCategory, onLogout }) {
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [cart, setCart] = useState([])
  const [openPanel, setOpenPanel] = useState('')
  const [orderMessage, setOrderMessage] = useState('')
  const query = search.trim().toLowerCase()
  const filteredProducts = useMemo(
    () => (query ? allProducts : category === 'tea' ? teaProducts : sushiProducts)
      .filter((product) => product.name.toLowerCase().includes(query)),
    [category, query],
  )
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  function addToCart(product) {
    setOrderMessage('')
    setCart((current) => {
      const existing = current.find((item) => item.category === product.category && item.name === product.name)
      return existing
        ? current.map((item) => item.category === product.category && item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }]
    })
  }

  function placeOrder() {
    if (cart.length === 0) return
    setCart([])
    setOrderMessage('Order placed! This demo does not send orders to a restaurant.')
  }

  const promoProduct = category === 'tea'
    ? { name: 'Tea Set', category: 'tea', price: 24.99, image: { file: 'crops/tea-promo.png' } }
    : { name: 'Nigiri Set', category: 'sushi', price: 22.99, image: { file: 'crops/sushi-feature.png' } }

  return (
    <main className={`menu-page menu-page--${category}`}>
      <MenuHeader
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
        onCart={() => setOpenPanel('cart')}
        onToggleNav={() => setOpenPanel(openPanel === 'nav' ? '' : 'nav')}
      />
      {category === 'sushi' && !query ? (
        <section className="sushi-layout" aria-label="Sushi menu">
          <div className="sushi-layout__main">
            <button type="button" className="sushi-feature" aria-label="View Nigiri set" onClick={() => setSelectedItem(promoProduct)} />
            <div className="sushi-small-grid">
              {sushiProducts.slice(0, 3).map((product) => (
                <ProductCard key={product.name} product={product} onSelect={setSelectedItem} onAdd={addToCart} />
              ))}
            </div>
          </div>
          <div className="sushi-right-list">
            {sushiProducts.slice(3).map((product) => (
              <HorizontalProductCard key={product.name} product={product} onSelect={setSelectedItem} onAdd={addToCart} />
            ))}
          </div>
        </section>
      ) : (
        <section className="menu-content" aria-label={`${category} menu`}>
          <div className="product-grid">
            {filteredProducts.map((product) => (
            <ProductCard
              key={`${product.category}-${product.name}`}
              product={product}
              showCategory={Boolean(query)}
              onSelect={setSelectedItem}
              onAdd={addToCart}
            />
            ))}
          {filteredProducts.length === 0 && <p className="no-results">No menu items match “{search}”.</p>}
          </div>
          {category === 'tea' && !query && (
            <aside className="promo-card">
              <ProductImage product={promoProduct} className="promo-card__image" />
              <div className="promo-card__copy">
                <h2>Tea</h2>
                <p className="promo-highlight">Set</p>
                <button type="button" className="promo-order" onClick={() => setSelectedItem(promoProduct)}>ORDER NOW</button>
                <strong>35% OFF</strong>
                <b>IN WEEKENDS</b>
              </div>
            </aside>
          )}
        </section>
      )}

      {selectedItem && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedItem(null)
        }}>
          <section className="item-dialog" role="dialog" aria-modal="true" aria-labelledby="item-title">
            <button className="modal-close" type="button" aria-label="Close item details" onClick={() => setSelectedItem(null)}>
              <Icon name="close" size={28} />
            </button>
            <ProductImage
              product={selectedItem}
              className={`item-hero-image${selectedItem.category === 'tea' ? ' item-hero-image--tea' : ''}`}
            />
            <h2 id="item-title">{selectedItem.name}</h2>
            <p className="item-description">
              {selectedItem.name === 'Sushi Boat'
                ? 'Set sail for flavor with our signature Sushi Boat! Loaded with melt-in-your-mouth salmon and tuna sashimi, hand-pressed nigiri, and our house-special maki rolls, this platter is crafted to impress. Ideal for date nights, family dinners, or group celebrations.'
                : `Enjoy our ${selectedItem.name}, freshly prepared with care and served with the signature Urban Roll flavor.`}
            </p>
            <div className="item-dialog__bottom">
              <strong>${selectedItem.price.toFixed(2)}</strong>
              <button className="add-button add-button--large" type="button" onClick={() => {
                addToCart(selectedItem)
                setSelectedItem(null)
              }}>add to cart</button>
            </div>
          </section>
        </div>
      )}

      {openPanel && (
        <div className="side-panel-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpenPanel('')
        }}>
          <aside className="side-panel" aria-label={openPanel === 'cart' ? 'Shopping cart' : 'Navigation'}>
            <button className="modal-close" type="button" aria-label="Close panel" onClick={() => setOpenPanel('')}>
              <Icon name="close" size={26} />
            </button>
            {openPanel === 'cart' ? (
              <>
                <h2>Your Cart</h2>
                {orderMessage && <p className="order-confirmation" role="status">{orderMessage}</p>}
                {cart.length === 0 ? (
                  !orderMessage && <p className="empty-cart">Your cart is empty.</p>
                ) : (
                  <>
                    <ul className="cart-list">
                      {cart.map((item) => (
                        <li key={`${item.category}-${item.name}`}>
                          <span>{item.name} ({item.category}) × {item.quantity}</span>
                          <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                        </li>
                      ))}
                    </ul>
                    <p className="cart-total">Total <strong>${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong></p>
                    <button className="order-button" type="button" onClick={placeOrder}>Order Now</button>
                  </>
                )}
              </>
            ) : (
              <>
                <h2>Urban Roll</h2>
                <button className="panel-link" type="button" onClick={() => { setCategory('tea'); setOpenPanel('') }}>Tea menu</button>
                <button className="panel-link" type="button" onClick={() => { setCategory('sushi'); setOpenPanel('') }}>Sushi menu</button>
                <button className="panel-link" type="button" onClick={onLogout}>Log out</button>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}

function App() {
  const [mode, setMode] = useState('login')
  const [category, setCategory] = useState('tea')
  const [notice, setNotice] = useState('')

  function navigate(nextMode) {
    setNotice('')
    setMode(nextMode)
  }

  async function createAccount(newAccount) {
    await postApi('auth/register', newAccount)
    setNotice('Account created. Log in with your new username and password.')
    setMode('login')
  }

  async function login(credentials) {
    await postApi('auth/login', credentials)
    setCategory('tea')
    setMode('menu')
  }

  if (mode === 'menu') {
    return <MenuPage category={category} setCategory={setCategory} onLogout={() => { setMode('login'); setNotice('You have been logged out.') }} />
  }

  return (
    <>
      {notice && <div className="global-notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}><Icon name="close" size={18} /></button></div>}
      <AuthPage
        mode={mode}
        onLogin={login}
        onCreateAccount={createAccount}
        onNavigate={navigate}
      />
    </>
  )
}

export default App
