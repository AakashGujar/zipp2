import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { testimonials } from '../utils/utils'

export function Testimonials() {
  return (
    <section className="py-24 px-4 bg-muted">
      <div className="container mx-auto max-w-[1300px]">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-4">1,157 people have said how good zipp2</p>
          <h2 className="text-3xl font-medium tracking-tight">Our happy users say about us</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{testimonial.text}</p>
              <div>
                <p className="font-medium">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}