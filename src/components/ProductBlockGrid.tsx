import ProductBlock from './Productblock'

const blocks = [
  {
    title: 'Catch Big <br><strong>Deals</strong> on the <br>Cameras',
    description: '',
    imageUrl: '/camerapng.png',
    link: '/products/canon-eos-r5',
    discount: 20,
  },
  {
    title: 'Tablets, <br>Smartphones <br><strong>and more</strong>',
    imageUrl: '/iphone17png.png',
    link: '/products/iphone-17-pro-256gb',
    discount: 5,
  },
  {
    title: 'Shop the <br><strong>Hottest</strong><br> Products',
    imageUrl: '/macbook1png.png',
    link: '/products/macbook-pro-m5',
    discount: 15,
  },
  {
    title: 'Shop the <br><strong>Hottest</strong><br>Products',
    imageUrl: '/recordcaset.png',
    link: '/products',
    discount: 50,
  },
]

export default function ProductBlockGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-4 max-w-[1600px] mx-2 sm:m-auto mb-5 sm:mb-10">
      {blocks.map((block, i) => (
        <ProductBlock key={i} {...block} />
      ))}
    </div>
  )
}
