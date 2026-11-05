import { productUrl, type Product } from '../../data/site';
import { useStore } from '../useStore';
import { EyeIcon, HeartIcon } from '../Icons';

const money = (n: number) => `US$${n.toFixed(2)}`;

export default function ProductCard({ product }: { product: Product }) {
  const { add, wish, toggleWish } = useStore();
  const url = productUrl(product.slug);
  const wished = wish.includes(product.slug);

  return (
    <article className="pcard">
      <div className="pcard-media">
        <a className="pcard-img" href={url} tabIndex={-1}>
          <img src={product.img} alt={product.name} loading="lazy" width={400} height={400} />
        </a>
        {product.badge && (
          <div className="pcard-badges">
            <span className={product.badge === 'New' ? 'new' : 'onsale'}>{product.badge}</span>
          </div>
        )}
        <div className="pcard-icons">
          <button type="button" aria-pressed={wished} aria-label={`Add ${product.name} to wishlist`} onClick={() => toggleWish(product.slug)}><HeartIcon filled={wished} /></button>
          <a href={url} aria-label={`Quick view ${product.name}`}><EyeIcon /></a>
        </div>
        {product.options
          ? <a className="pcard-cart" href={url}>Select options</a>
          : <button type="button" className="pcard-cart" onClick={add}>Add to cart</button>}
      </div>
      <div className="pcard-price">
        {product.was && <del>{money(product.was)}</del>}
        {product.was ? <ins>{money(product.price)}</ins> : money(product.price)}
      </div>
      <h3 className="pcard-title"><a href={url}>{product.name}</a></h3>
    </article>
  );
}
