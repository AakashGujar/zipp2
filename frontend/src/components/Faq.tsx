import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"
import { faqs } from '../utils/utils'

export function Faq() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-2">Have a question?</h2>
          <p className="text-sm text-gray-600">FAQ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm text-gray-600">
            Didn't find the answer you are looking for?{' '}
            <a href="#" className="text-blue-600 hover:underline">Contact our support</a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

