import React from 'react'
import Card from '../components/Card/Card'
import Button from '../components/Button/Button'
import styles from './Knowledge.module.css'

const supportArticles = [
  { id: 'kb-01', title: 'Getting Started', description: 'Guides to configure your store faster.' },
  { id: 'kb-02', title: 'Personal Settings', description: 'Manage your admin profile and preferences.' },
  { id: 'kb-03', title: 'Billing', description: 'Handle invoices, payment methods, and taxes.' },
  { id: 'kb-04', title: 'Commerce', description: 'Best practices for product listings and merchandising.' }
]

const Knowledge = () => {
  return (
    <div className={styles.page}>
      <Card title="Knowledge Base" subtitle="Handpicked guides to help your team succeed.">
        <div className={styles.grid}>
          {supportArticles.map((article) => (
            <article key={article.id} className={styles.article}>
              <span className={styles.icon}>{article.title.charAt(0)}</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <Button type="button" variant='ghost'>View tutorials</Button>
            </article>
          ))}
        </div>
      </Card>
      <Card title="Need more help?" subtitle="Connect with success engineers for 1:1 onboarding.">
        <div className={styles.support}>
          <p>Schedule a session with our support team and get personalized recommendations.</p>
          <Button type="button" variant='primary'>Contact Support</Button>
        </div>
      </Card>
    </div>
  )
}

export default Knowledge
