import React, { useEffect, useState } from 'react'
import styles from '../accountForm.module.scss'
import { useRouter } from 'next/router'
import accountsController from '@/controllers/accounts'
import { notify } from '@/config/error'
import AccountForm from '@/components/forms/AccountForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import Button from '@/components/atoms/buttons/button'

const EditAccount = () => {
    const router = useRouter()
    const { id } = router.query
    const [initialLoading, setInitialLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [initialAccount, setInitialAccount] = useState(null)

    useEffect(() => {
        if (!id) return
        const load = async () => {
            try {
                setInitialLoading(true)
                const res = await accountsController.getAccountById(id)

                if (res && res.success) {
                    const acc = res.data?.account?.data ?? res.data?.account ?? res.data ?? {}
                    setInitialAccount({
                        id: acc.id,
                        name: acc.name || '',
                        price: acc.price || '',
                        quantity: acc.quantity || 1,
                        source: acc.source || '',
                        category: acc.category || '',
                        status: acc.status || 'IN_STOCK',
                        accountData: acc.accountData || null,
                        images: acc.images || [],
                    })
                } else {
                    notify(res?.error?.message || 'Failed to load account')
                    router.push('/accounts')
                }
            } catch (err) {
                notify('Failed to load account')
                router.push('/accounts')
            } finally {
                setInitialLoading(false)
            }
        }
        load()
    }, [id])

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
            setSaving(true)
            const res = await accountsController.updateAccount(id, formData)

            if (res && res.success) {
                notify('Account updated successfully', 'success')
                router.push('/accounts')
            } else {
                notify(res?.error?.message || 'Failed to update account', 'error')
            }
        } catch (err) {
            notify('Failed to update account', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (initialLoading) return <Loading />

    return (
        <div className={styles.accountFormPage}>
            <PageHead current="Accounts">
                <Head title="Edit Account" back="/accounts">
                    <Button
                        style="outline"
                        onClick={() => router.push(`/accounts/${id}/view`)}
                    >
                        View Details
                    </Button>
                </Head>
            </PageHead>
            <Container>
                <Card>
                    <AccountForm
                        key={id}
                        initial={initialAccount || {}}
                        submitting={saving}
                        onCancel={() => router.push('/accounts')}
                        onSubmit={submit}
                        isEdit={true}
                    />
                </Card>
            </Container>
        </div>
    )
}

export default EditAccount
