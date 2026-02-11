import * as React from 'react';
import { HeaderNavigation, ALIGN, StyledNavigationList, StyledNavigationItem } from 'baseui/header-navigation';
import { StyledLink } from 'baseui/link';
import { Modal, ModalBody, SIZE, ROLE } from 'baseui/modal';
import StyletronProvider from '../StyletronProvider';

const HeaderContent = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [posts, setPosts] = React.useState([]);

    React.useEffect(() => {
        fetch('/search.json')
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error('Failed to fetch search data', err));
    }, []);

    const filteredPosts = React.useMemo(() => {
        if (!searchTerm) return posts.slice(0, 5);
        const lowerTerm = searchTerm.toLowerCase();
        return posts.filter(post =>
            post.title.toLowerCase().includes(lowerTerm) ||
            (post.description && post.description.toLowerCase().includes(lowerTerm))
        ).slice(0, 10);
    }, [searchTerm, posts]);

    return (
        <>
            <div className="w-full sticky top-0" style={{
                height: '64px',
                zIndex: 2002,
                backgroundColor: '#000000',
                backdropFilter: 'blur(10px)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                paddingTop: '12px',
                paddingBottom: '12px'
            }}>
                <div className="w-full max-w-[1310px] mx-auto px-4 h-full flex items-center justify-between">
                    <HeaderNavigation overrides={{
                        Root: {
                            style: ({ $theme }) => ({
                                borderBottom: 'none',
                                backgroundColor: 'transparent',
                                color: '#FFFFFF',
                                position: 'static',
                                width: '100%',
                                fontFamily: 'UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
                            })
                        }
                    }}>
                        <StyledNavigationList $align={ALIGN.left} style={{ paddingLeft: 0 }}>
                            <StyledNavigationItem style={{ paddingLeft: 0 }}>
                                <a href="/" style={{
                                    textDecoration: 'none',
                                    color: '#FFFFFF',
                                    fontFamily: 'UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
                                    fontSize: '24px',
                                    fontWeight: '400',
                                    display: 'flex',
                                    alignItems: 'center',
                                    lineHeight: '1'
                                }}>
                                    Blog
                                </a>
                            </StyledNavigationItem>
                        </StyledNavigationList>
                        <StyledNavigationList $align={ALIGN.center} />
                        <StyledNavigationList $align={ALIGN.right} style={{ paddingRight: 0 }}>
                            <StyledNavigationItem style={{ paddingRight: 0 }}>
                                <div
                                    onClick={() => setIsOpen(true)}
                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <span style={{
                                        color: '#FFFFFF',
                                        fontFamily: 'UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                    }}>
                                        Search
                                    </span>
                                </div>
                            </StyledNavigationItem>
                        </StyledNavigationList>
                    </HeaderNavigation>
                </div>
            </div>

            <div className="w-full sticky top-[64px]" style={{
                zIndex: 2001,
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                paddingBottom: '12px',
                paddingTop: '12px'
            }}>
                <div className="w-full max-w-[1310px] mx-auto px-4 h-full flex items-center justify-between overflow-x-auto no-scrollbar">
                    <a href="/tags/engineering" style={{ textDecoration: 'none' }}>
                        <div style={{
                            fontFamily: 'UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
                            fontWeight: '700',
                            fontSize: '24px',
                            color: '#000000',
                            marginRight: 'auto',
                            cursor: 'pointer'
                        }}>
                            Engineering
                        </div>
                    </a>
                    <div className="flex space-x-8">
                        {['Backend', 'DevOps', 'Communication', 'Etc'].map((item) => (
                            <a key={item} href={`/tags/${item.toLowerCase()}`} style={{
                                textDecoration: 'none',
                                color: '#555555',
                                fontFamily: 'UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
                                fontSize: '14px',
                                fontWeight: '400',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer'
                            }}>
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                onClose={() => setIsOpen(false)}
                closeable
                isOpen={isOpen}
                animate
                autoFocus
                size={SIZE.default}
                role={ROLE.dialog}
                overrides={{
                    Root: {
                        style: {
                            zIndex: 99999
                        }
                    },
                    Backdrop: {
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 99999
                        }
                    },
                    Dialog: {
                        style: {
                            backgroundColor: '#262626',
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px',
                            width: '640px',
                            boxShadow: '0px 20px 60px rgba(0,0,0,0.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            outline: 'none',
                            maxHeight: '80vh',
                            overflow: 'hidden'
                        }
                    },
                    DialogContainer: {
                        style: {
                            alignItems: 'flex-start',
                            paddingTop: '15vh',
                        }
                    },
                    Close: {
                        component: () => null
                    }
                }}
            >
                <ModalBody style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '24px 24px', borderBottom: '1px solid #333' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '16px' }}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            placeholder="Search posts..."
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#FFFFFF',
                                fontSize: '24px',
                                fontFamily: 'UberMoveText, system-ui, sans-serif',
                                fontWeight: '300',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ padding: '8px 0', overflowY: 'auto' }}>
                        {/* Section Header */}
                        <div style={{ padding: '16px 24px 8px 24px', color: '#888', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {searchTerm ? 'Search Results' : 'Recent Posts'}
                        </div>

                        {/* Results List */}
                        {filteredPosts.map((result, index) => (
                            <a key={index} href={`/blog/${result.slug}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex',
                                    padding: '12px 24px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '8px',
                                        backgroundColor: '#444',
                                        marginRight: '16px',
                                        backgroundImage: result.heroImage ? `url(${typeof result.heroImage === 'string' ? result.heroImage : result.heroImage.src})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                                            {result.title}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', color: '#999', fontSize: '12px' }}>
                                            <span style={{ backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', color: '#ccc' }}>
                                                {result.tags ? result.tags[0] : 'Blog'}
                                            </span>
                                            <span>{new Date(result.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                        {filteredPosts.length === 0 && (
                            <div style={{ padding: '24px', color: '#999', textAlign: 'center' }}>
                                No posts found.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ borderTop: '1px solid #333', padding: '12px 24px', color: '#666', fontSize: '13px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#262626' }}>
                        <span>Type to search...</span>
                        <span><kbd style={{ backgroundColor: '#444', padding: '2px 4px', borderRadius: '4px', color: '#bbb', fontFamily: 'monospace' }}>ESC</kbd> to close</span>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};

export default function Header() {
    return (
        <StyletronProvider>
            <HeaderContent />
        </StyletronProvider>
    );
}
