import React, { useEffect, useState } from 'react'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import { FaDownload, FaEye } from 'react-icons/fa'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import { notify } from '@/config/error'
import onboardingController from '@/controllers/onboarding'
import SearchInput from '@/components/atoms/inputs/searchInput'
import moment from 'moment'

const UserAnswersPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [page, limit])

    const fetchUsers = async () => {
        try {
            setPageLoading(true)
            const res = await onboardingController.getAllAnswers(page, limit)
            if (res.success) {
                setUsers(res.data.data || [])
                setTotal(res.data.pagination.total)
                setTotalPages(res.data.pagination.totalPages)
            }
        } catch (error) {
            notify(error)
        } finally {
            setPageLoading(false)
        }
    }

    const viewUserDetails = (user) => {
        setSelectedUser(user)
        setDetailsOpen(true)
    }

    const handleExport = async () => {
        try {
            setExporting(true)
            const response = await onboardingController.exportAnswers()

            if (response.success) {
                const url = window.URL.createObjectURL(response.data)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `onboarding-responses-${moment().format('YYYY-MM-DD')}.xlsx`)
                document.body.appendChild(link)
                link.click()
                link.remove()

                notify({ message: 'Export successful!', type: 'success' })
            } else {
                notify(response.error)
            }
        } catch (error) {
            notify(error)
        } finally {
            setExporting(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.discordUsername?.toLowerCase().includes(search.toLowerCase())
    )

    if (pageLoading) {
        return (
            <div style={{ width: '100%' }}>
                <PageHead current="User Answers">
                    <Head title="User Onboarding Responses" back="/" />
                </PageHead>
                <Container>
                    <Loading />
                </Container>
            </div>
        )
    }

    return (
        <div style={{ width: '100%' }}>
            <PageHead current="User Answers">
                <Head title="User Onboarding Responses" back="/" />
            </PageHead>

            <Container>
                <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <SearchInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                    />
                    <Button onClick={handleExport} disabled={exporting} primary>
                        <FaDownload /> {exporting ? 'Exporting...' : 'Export to Excel'}
                    </Button>
                </div>

            <Card title={`${total} Users Registered`}>
                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>User ID</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Full Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Email</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Discord</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Answers</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Registered At</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.userId} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{user.userId}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{user.fullname}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{user.email}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            background: '#e3f2fd',
                                            color: '#1976d2',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            border: '1px solid #90caf9'
                                        }}>
                                            {user.discordUsername}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            background: '#e8f5e9',
                                            color: '#2e7d32',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {user.answers.length} answers
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>
                                        {moment(user.createdAt).format('MMM DD, YYYY HH:mm')}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button
                                            onClick={() => viewUserDetails(user)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#e3f2fd',
                                                color: '#1976d2',
                                                border: 'none',
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                fontSize: 13,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6
                                            }}
                                        >
                                            <FaEye /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                        No users found.
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            style={{
                                padding: '8px 16px',
                                background: page === 1 ? '#f0f0f0' : '#fff',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                cursor: page === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            style={{
                                padding: '8px 16px',
                                background: page === totalPages ? '#f0f0f0' : '#fff',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                cursor: page === totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </Card>

            {/* User Details Modal */}
            {detailsOpen && selectedUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 8,
                        width: '100%',
                        maxWidth: 800,
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: 24
                    }}>
                        <h3 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
                            User Onboarding Details
                        </h3>

                        {/* User Info */}
                        <div style={{
                            padding: 16,
                            background: '#f8f9fa',
                            borderRadius: 8,
                            marginBottom: 24,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 16
                        }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>User ID</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedUser.userId}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Discord ID</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedUser.discordId}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Full Name</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedUser.fullname}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Email</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedUser.email}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Discord Username</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedUser.discordUsername}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Registered At</div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>
                                    {moment(selectedUser.createdAt).format('MMM DD, YYYY HH:mm')}
                                </div>
                            </div>
                        </div>

                        {/* Answers */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Onboarding Answers</h4>

                            {selectedUser.answers.map((answer, index) => (
                                <div key={index} style={{
                                    padding: 16,
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 8,
                                    marginBottom: 12
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1976d2' }}>
                                            {answer.question}
                                        </div>
                                        {answer.required && (
                                            <span style={{
                                                padding: '2px 8px',
                                                background: '#ffebee',
                                                color: '#c62828',
                                                borderRadius: 4,
                                                fontSize: 11,
                                                fontWeight: 600
                                            }}>
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', color: '#333' }}>
                                        {answer.answer || 'No answer provided'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Close Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setDetailsOpen(false)} primary>Close</Button>
                        </div>
                    </div>
                </div>
            )}
            </Container>
        </div>
    )
}

export default UserAnswersPage
