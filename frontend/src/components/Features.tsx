import { motion } from "framer-motion";
import { features } from "../utils/utils";

export function Features() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-[1300px]">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 rounded-lg transform rotate-1" />
            <div className="relative bg-background px-4 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 font-semibold text-sm">
              FLEXIBLE FEATURES
            </div>
          </div>
          <h2 className="text-3xl font-medium tracking-tight mb-4">
            Everything you need for audience
            <br />
            analysis and understanding
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get a full & powerful solution to generate, share and track links
            for every form of communication.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="mb-4">
                <feature.icon className="h-8 w-8 text-foreground transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
