import React, { useState } from 'react'
import styles from './accountForm.module.scss'
import { useRouter } from 'next/router'
import accountsController from '@/controllers/accounts'
import { notify } from '@/config/error'
import AccountForm from '@/components/forms/AccountForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'

const NewAccount = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const submit = async (formData) => {
        const name = formData.get('name')
        const category = formData.get('category')

        const errors = []
        if (!(name || '').trim()) errors.push('Name is required')
        if (!category) errors.push('Category is required')

        if (errors.length) {
            notify(errors[0])
            return
        }

        try {
            setLoading(true)
            const res = await accountsController.createAccount(formData)

            if (res && res.success) {
                notify('Account created successfully', 'success')
                router.push('/accounts')
            } else {
                notify(res?.error?.message || 'Failed to create account', 'error')
            }
        } catch (err) {
            notify('Failed to create account', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.accountFormPage}>
            <PageHead current="Accounts">
                <Head title="Add New Account" back="/accounts" />
            </PageHead>
            <Container>
                <Card>
                    <AccountForm
                        submitting={loading}
                        onCancel={() => router.push('/accounts')}
                        onSubmit={submit}
                        isEdit={false}
                    />
                </Card>
            </Container>
        </div>
    )
}

export default NewAccount
